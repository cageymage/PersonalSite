---
title: 'The Vapor Chamber Addendum: Holy Shit, How Is This HDFury Thing $250?'
description: 'Spitefully Building a TV Gaming PC'
pubDate: 'August 29 2026'
updatedDate: 'August 29 2026'
subject: 'Hardware and Hobbies'
order: 2
heroImage: '/blog-images/latte-larrys.jpg'
---

Table of contents:
- [Why the built-in settings did nothing](#why-the-built-in-settings-did-nothing)
- [Potential EZ Mode - but wait, there's more!](#potential-ez-mode---but-wait-theres-more)
- [The hardware that DID work](#the-hardware-that-did-work)
- [Problem two: the device vanishes on suspend](#problem-two-the-device-vanishes-on-suspend)
- [Problem three: sleep hooks never ran](#problem-three-sleep-hooks-never-ran)
- [Problem four: the actual bug](#problem-four-the-actual-bug)
- [Problem five: the Apple TV steals the display](#problem-five-the-apple-tv-steals-the-display)
- [The working configuration](#the-working-configuration)
- [Problem six: waking with the controller](#problem-six-waking-with-the-controller)

<br> 

# Making my DIY Spite Machine behave like a console
I wanted my newly built Spite Machine to work exactly like the consoles gathering dust next to -- i.e. putting the PC to sleep turns off the TV, and waking the PC turns the TV on. Fortunately, since I was using SteamOS, this functionality was baked right into the OS! I set the settings in SteamOS 3.8.16 (Settings -> Display -> Enable CEC), and my TV (Samsung S90c -> Home -> Settings -> All Setting -> Connection -> External Device Manager -> Anynet+ (HDMI-CEC)). And then tried it out....

In case you had any guesses, the reason I'm writing this blog is because it didn't work at all! BUT. I did get it working 100% like I wanted, so continue on, kind reader :) 

Note: some of the following may be AI slop, because I'm not going to try and type out everything I did and the reasons for it. Since I used Claude as my primary troubleshooting source, it had a record of most of what I did, and can summarize it fine. So forgive me, and lay down your pitchforks and torches.

Also, this took me numerous days to accomplish. My ass and neck hurt from having to sit right in front of my giant TV on a stool with a crappy keyboard and mouse awkwardly placed on my lap or ground... And I am sharing this so you don't have to!

Anytime code is referenced below, just assume `bash` CLI

### Why the built-in settings did nothing
SteamOS ships a CEC daemon (`cecd`) with toggles for TV-on-wake and TV-standby-on-sleep. Those toggles drive a `/dev/cec*` device. If no such device exists, the switches are wired to nothing — and the UI gives you no hint of that.

```
ls -l /dev/cec*
# ls: cannot access '/dev/cec*': No such file or directory
```

Consumer graphics cards do not implement HDMI-CEC. Not AMD, not NVIDIA, not Intel. CEC is a physical wire — pin 13 on the HDMI connector — and it needs a controller chip on each end. GPUs don't have one. Your Apple TV and game consoles do, which is why they can turn the TV on and your PC can't.

### Potential EZ Mode - but wait, there's more!
It's a trap! Devices / dongles on amazon that say "supports" CEC -- but this means CEC _passthru_, which means it can pass thru CEC commands from the OS or other hardware, but not ADD it to the chain. I'm not going to delve here very long because it wasn't relevant to the fix for me. YMMV.

### The hardware that DID work
A Pulse-Eight USB-CEC Adapter (~$50–60, pulse-eight.com).

It has its own CEC controller and talks to the PC over USB, so it doesn't care what your GPU can do, what your driver implements, or whether some vendor wired a pin. It sits inline on the HDMI run. The `pulse8-cec` driver is already in the SteamOS kernel (`CONFIG_USB_PULSE8_CEC=m`).

There's essentially no competing product — it's overpriced precisely because nothing else fills the niche. A spare Raspberry Pi with libCEC is the only real DIY substitute, and that's a whole second machine to maintain.

Plugged in, immediately:
```
ls -l /dev/cec0
# crw-rw----+ 1 root video 240, 0 /dev/cec0

cec-ctl -d /dev/cec0 --show-topology
```
```
Topology:
    0.0.0.0: TV                    (Samsung QN77S90CDF)
        1.0.0.0: Backup 2          (me)
        2.0.0.0: Playback Device 3 (PlayStation 5)
        3.0.0.0: Playback Device 1 (Apple TV)
```
Write down your own physical address — mine is 1.0.0.0. You need it to tell the TV which input to switch to. Note the logical addresses too; you'll need the Apple TV's later.

Manual commands worked right away:
```
cec-ctl -d /dev/cec0 --to 0 --image-view-on                     # TV on
cec-ctl -d /dev/cec0 --to 0 --active-source phys-addr=1.0.0.0   # switch input
cec-ctl -d /dev/cec0 --to 0 --standby                           # TV off
```

Test `--image-view-on` with the TV actually off. A successful transmit only means the message left the adapter — it says nothing about whether the TV obeyed.

### Problem two: the device vanishes on suspend

Working hardware, still no automatic behavior. After every suspend, `/dev/cec0` was gone.

The USB device survived (`lsusb` still listed it) and `/dev/ttyACM0` was still there. What died was the serio binding. The Pulse-Eight presents as a USB serial device, and something has to attach that serial port to the `pulse8-cec` driver before a CEC node exists. Suspend tears that down.

Rebuilding it by hand worked:
```
sudo inputattach --daemon --pulse8-cec /dev/ttyACM0
```

### Problem three: sleep hooks never ran

The obvious answer is a script in `/etc/systemd/system-sleep/`. Mine never executed — no output, no log, nothing in the journal, despite correct permissions and other scripts living happily in `/usr/lib/systemd/system-sleep/`.

Rather than keep debugging that, I switched to explicit systemd units ordered around `suspend.target`: one `After=` for resume, one `Before=` for suspend.

### Problem four: the actual bug

The resume unit ran. `/dev/cec0` appeared. The TV turned on. And a couple of minutes later the node was gone again.

The timestamps gave it away:
```
13:00:05  systemd: cec-resume.service: Deactivated successfully.
13:00:05  cecd:    Device /com/steampowered/CecDaemon1/Devices/Cec0 disconnected
```
Same second, every time. systemd's default `KillMode=control-group` kills everything the service spawned when the service exits — including the `inputattach --daemon` process that owns the serio binding. The service was destroying its own work on the way out.
```
ini
KillMode=process
```
**One line. That was the whole thing.**

### Problem five: the Apple TV steals the display

At this point it worked and I declared victory. What I'd written off as "some negotiation on a busy bus" turned out to be an actual, reproducible failure.

What I wanted was simple: **I want my Apple TV to act like my Xbox and PS5.** Those only power on if I use their specific controller. They don't wake when the TV does.

The Apple TV does. My resume script turns the TV on, the TV powering on wakes the Apple TV unprompted over CEC, and the Apple TV then broadcasts `<Active Source>` for its own port. The TV prefers that input over the PC, which defeats the entire purpose of the CEC on the PC. My `--active-source call` was a race I sometimes won and sometimes lost.

Apple documents the wake as intended: if your TV supports HDMI-CEC, the Apple TV turns on when you turn on your TV. There's a nastier second-order effect too — once the Apple TV is awake its own inactivity timer eventually fires and sends the TV to standby, so the TV shuts itself off twenty minutes into a game for no visible reason.

**What doesn't work**
- The Apple TV's own CEC toggle (Settings → Remotes and Devices → Control TVs and Receivers). It mostly governs the outbound direction. Turning it off doesn't reliably stop the wake, and you lose the ability to turn the TV on with the Siri Remote — you give up the feature and keep the bug.
- TV-side settings. Samsung's Anynet+ is a single global on/off: no per-port, no per-device, no "don't auto-switch on wake". The S90 series has no default-input-on-power-on setting either, so you can't tell it to boot to HDMI 1.
- Blocking pin 13 on the Apple TV's HDMI run. Deterministic and effective, but CEC is one shared bidirectional wire, so it's all-or-nothing — the Apple TV can no longer turn the TV on either.
- An HDFury does per-port CEC filtering and gives exactly the asymmetry you want. It's also $250+, because it's an EDID manager and video processor that happens to have the feature as a footnote. I'm not spending that to fix one toggle.

**What works: evict it**

I already have a CEC transmitter on the bus. A directed standby affects only the addressed device:

```
cec-ctl -d /dev/cec0 --to 4 --standby
```

Address 4 is Playback Device 1 — the Apple TV in the topology above.

One more reason directed beats broadcast: cecd listens for the TV's broadcast standby and suspends the PC when it hears one. A message addressed specifically to 4 never trips that.

**The part I got wrong first**

My initial version used a fixed `sleep 3` between waking the TV and evicting the Apple TV. It worked. Then a few days later it started failing again — Apple TV waking about twenty seconds after the PC, exactly as before.

The fix was fine; the timing was a guess. Once I logged the actual timestamps, image-view-on went out at 641.6s and the standby fired twelve seconds later — nowhere near three. The Apple TV doesn't wake until the TV has actually powered on, so a standby that fires early hits a sleeping device and does nothing, and then the TV finishes coming up and the Apple TV wakes unopposed.

Fixed delays in CEC scripts are a slow-motion failure. They work until the bus is slightly busier or the TV is slightly slower, and then they don't, and it looks random.

Three changes made it reliable:

1. Poll for the TV's power state instead of guessing. `--give-device-power-status` until it reports `pwr-state: on`.
2. Look up the Apple TV's logical address by name rather than hardcoding it. Addresses are negotiated at power-on and aren't guaranteed stable — after a power cut, every device renegotiates.
3. Send the standby three times across six seconds, re-claiming active source after each. It no longer matters exactly when the Apple TV stirs; one of the rounds catches it, and if it grabs the input between rounds it gets taken straight back.

**Reading the log**

A directed message that reached a live device looks like this:
```
Transmit from Playback Device 2 to Playback Device 1 (8 to 4):
STANDBY (0x36)
        Sequence: 12 Tx Timestamp: 17439.552906s
```

Note what's absent: `no Tx, Aborted, Max Retries`. Compare with the pre-suspend standby to the TV, which shows the abort on every run and works fine anyway — the TV is already powering down by the time retries expire. Presence or absence of that line is how you tell whether anything answered you.

**A free confirmation you already have.** My adapter never allocates itself logical address 4. It tries 4 first and can't have it, because the Apple TV is holding it. If your adapter is landing on 8 or 13, something else owns the lower slots.

### The working configuration

Four files plus a udev rule. SteamOS keeps `/etc` writable, so no `steamos-readonly` `disable` needed. Note `/usr/local/bin` is read-only, which is why the scripts live in `/etc`.
`/etc/cec-resume.sh`
```
#!/bin/bash
exec >> /var/log/cec-resume.log 2>&1
echo "=== resume $(date) ==="

/usr/bin/pkill -f "inputattach.*pulse8-cec"
sleep 1
/usr/bin/inputattach --daemon --pulse8-cec /dev/ttyACM0
echo "inputattach exit: $?"

for i in $(seq 1 15); do
  [ -e /dev/cec0 ] && break
  sleep 1
done
ls -l /dev/cec0

sleep 2
/usr/bin/cec-ctl -d /dev/cec0 --skip-info --to 0 --image-view-on

for i in $(seq 1 20); do
  /usr/bin/cec-ctl -d /dev/cec0 --skip-info --to 0 --give-device-power-status 2>&1 | grep -q "pwr-state: on" && break
  sleep 1
done
echo "tv reported on after ${i}s"

ATV=$(/usr/bin/cec-ctl -d /dev/cec0 --skip-info --show-topology 2>/dev/null | awk '/System Information for device/{d=$5} /OSD Name.*Apple TV/{print d; exit}')
[ -z "$ATV" ] && ATV=4
echo "apple tv logical address: $ATV"

for i in 1 2 3; do
  /usr/bin/cec-ctl -d /dev/cec0 --skip-info --to $ATV --standby
  /usr/bin/cec-ctl -d /dev/cec0 --skip-info --to 0 --active-source phys-addr=1.0.0.0
  sleep 2
done
echo "=== done ==="
```
`/etc/systemd/system/cec-resume.service`

```
ini
[Unit]
Description=Reattach CEC adapter and wake TV after resume
After=suspend.target hibernate.target hybrid-sleep.target suspend-then-hibernate.target

[Service]
Type=oneshot
KillMode=process
RemainAfterExit=no
ExecStart=/etc/cec-resume.sh

[Install]
WantedBy=suspend.target hibernate.target hybrid-sleep.target suspend-then-hibernate.target
```
`/etc/cec-suspend.sh`
```
#!/bin/bash
exec >> /var/log/cec-resume.log 2>&1
echo "=== suspend $(date) ==="
[ -e /dev/cec0 ] || exit 0
/usr/bin/cec-ctl -d /dev/cec0 --to 0 --standby
echo "=== standby sent ==="
```
`/etc/systemd/system/cec-suspend.service`
```
ini
[Unit]
Description=Send CEC standby before suspend
Before=suspend.target hibernate.target hybrid-sleep.target suspend-then-hibernate.target

[Service]
Type=oneshot
ExecStart=/etc/cec-suspend.sh

[Install]
WantedBy=suspend.target hibernate.target hybrid-sleep.target suspend-then-hibernate.target
```
Install and cap the log:
```
sudo chmod +x /etc/cec-resume.sh /etc/cec-suspend.sh
sudo systemctl daemon-reload
sudo systemctl enable cec-resume.service cec-suspend.service

sudo tee /etc/logrotate.d/cec-resume > /dev/null << 'EOF'
/var/log/cec-resume.log {
    weekly
    rotate 2
    size 1M
    missingok
    notifempty
    copytruncate
}
EOF
```
Replace `1.0.0.0` with your own physical address. If you have no Apple TV, drop the lookup and the standby entirely.

**Why the details matter**
- `pkill` first. `--daemon` leaves a process running. A stale one holding `/dev/ttyACM0` blocks the new attach, and you end up with a pile of orphaned `serio` instances.
- Poll, don't guess. Twice — once for the CEC node, once for the TV's power state. Every fixed delay in this script that I replaced with a poll was a bug waiting to surface.
- Log from line one, before any early-exit guard. My first version had the exec below a guard, so a failed guard produced total silence — indistinguishable from the script never running.
- Log to `/var/log`, not `/tmp`. I lost my entire debugging history to a power cut, then spent a while confused by a missing log file that turned out to mean nothing: `/tmp` clears on boot, and the file only reappears after the next suspend. `/var` persists.
- `--skip-info` suppresses the driver-info dump each `cec-ctl` call prints. With ten calls per wake, the log is unreadable without it.
- `--to 0 --standby` only affects the TV. It doesn't suspend your PC, which is what you want in a pre-suspend hook.

**How to test this**

The failure only happens when the TV goes from off to on — that transition is what wakes the Apple TV. Leaving the TV on and suspending the PC tests nothing.

You don't need to type blind, though. Put the Apple TV to sleep, type sudo systemctl suspend, and let the pre-suspend hook turn the TV off for you. Wait thirty seconds, wake with the power button, and read the log afterward.

### Problem six: waking with the controller

I wanted the last console behavior: press a button on the controller, everything comes up. I spent a long evening concluding this was impossible, and I was wrong for an interesting reason.

**The 2.4GHz dead end**

My 8BitDo Ultimate 2's dongle:

```
sudo lsusb -v -d 2dc8:310b 2>/dev/null | grep -iA3 bmAttributes
#     bmAttributes         0x80
```

`bmAttributes` is a bitfield. Bit 7 is always set, bit 6 is self-powered, **bit 5 is remote wakeup**. `0x80` is bit 7 alone — the dongle does not advertise remote wakeup and can never signal the host to resume. No udev rule, no `power/wakeup` value, no BIOS setting changes that.

There is a workaround people use, and it doesn't need remote wakeup at all: the 8BitDo dongle enumerates as a different USB device depending on state, appearing as "8BitDo IDLE" with one product ID when the controller is off and another when it's on. Powering on the controller is effectively a hotplug, and the root hub notices the port-status change. That's what SteamOS-USB-Wake automates.

Arming the root hub broke suspend entirely on my board. It also has a well-known downside even when it works: the state change is symmetric, so the controller powering off or hitting its idle timeout wakes the machine too. People report PCs waking the instant a controller sleeps.

Bluetooth changed everything

On a whim I switched the controller from 2.4GHz to Bluetooth. That changes the mechanism completely — the BT radio stays enumerated whether the controller is on or off, so there's no port-change to catch. (This is also why SteamOS-USB-Wake explicitly doesn't work with built-in BT: it needs a USB device that appears and disappears.)

What it gives you instead is device-level remote wakeup on the Bluetooth radio itself. Find it:

```
BT=$(readlink -f /sys/class/bluetooth/hci0/device | sed 's|/[^/]*:[0-9.]*$||')
cat "$BT/idVendor" "$BT/idProduct"
sudo lsusb -v -d "$(cat $BT/idVendor):$(cat $BT/idProduct)" 2>/dev/null | grep -iA3 bmAttributes
```
Mine (`0489:e10a`, on `usb1/1-12`):
```
bmAttributes         0xe0
  Self Powered
  Remote Wakeup
```

`0xe0` is bits 7, 6, and 5. Unlike the 8BitDo dongle, this radio can raise a resume. It was just never armed:

```
echo enabled | sudo tee /sys/bus/usb/devices/1-12/power/wakeup
sudo systemctl suspend
```

Press Home. _It worked on the first try._

**The key difference from the failed attempt:** this arms one device, not an entire root hub. The root-hub approach failed because my board's xHCI controller mishandles the armed state across S3. Device-level wake doesn't go through that path.

**The scary-looking error that doesn't matter**
```
xhci_hcd 0000:10:00.0: xHC error in resume, USBSTS 0x401, Reinit
usb 1-12: reset full-speed USB device number 5 using xhci_hcd
```

That save/restore failure still happens on every single resume. The controller reinitializes and every device on the bus gets reset and re-enumerated — including the Bluetooth radio — and everything comes back fine. It's cosmetic noise on this board, and I nearly spent an evening in BIOS chasing it. If your wake works, don't let this scare you.

Make it persistent

`power/wakeup` reverts on every boot. A udev rule matching vendor and product IDs survives reboots and doesn't care if the port number changes:

```
sudo tee /etc/udev/rules.d/90-bt-wakeup.rules > /dev/null << 'EOF'
ACTION=="add|change", SUBSYSTEM=="usb", ATTR{idVendor}=="0489", ATTR{idProduct}=="e10a", ATTR{power/wakeup}="enabled"
EOF

sudo udevadm control --reload-rules
sudo udevadm trigger --subsystem-match=usb
cat /sys/bus/usb/devices/1-12/power/wakeup   # should print: enabled
```
Substitute your own IDs. Reboot and re-check — that's the real test.

**If yours doesn't work**

Check BIOS before assuming the hardware can't:

- ErP / ErP Ready → Disabled. This cuts USB power during suspend on some boards, which kills the radio entirely.
- USB Wake Support / Wake from USB → Enabled.
- On AMD desktops, Power Supply Idle Control → Typical Current Idle and Global C-state Control → Disabled. A controller can wake the board electrically while the OS resumes only partway — machine pings but no display, no SSH.

And if your BT radio also reports `0x80`, a cheap USB Bluetooth dongle that advertises remote wakeup is a $15 fix.

### Results

Press Home on the controller. The PC wakes, the TV turns on, it lands on my input, and the Apple TV stays asleep. Sleep the PC and the TV goes off with it. That's the PS5's behavior on a DIY box.

One bonus I didn't plan for: turning the TV off with its remote now suspends the PC, because `cecd` listens for the TV's broadcast standby and acts on it. That half came free once real hardware existed.

Two things still worth watching. **Spurious wakes** — the known failure mode with controller wake is the machine resuming when the controller times out. That's mostly a 2.4GHz dongle problem, but if you find the PC awake in the morning, `sudo journalctl -b -1 | grep -i "PM: suspend exit"` shows when. And logical address drift — twice my adapter came up as 13 (Backup 2) instead of 8, meaning more slots were occupied than I own devices, suggesting stale allocations on the bus. Auto-detecting the Apple TV's address by name removed my exposure to this, but it's why you shouldn't hardcode a number.

#### If you're attempting this
1. Skip the DP adapters. Buy the Pulse-Eight. Anything claiming CEC support over DP-to-HDMI is a coin flip on whether a pin got soldered, and you can't tell from the box.
2. Verify manually before scripting. Get `--show-topology` returning a full device list and `--image-view-on` waking a genuinely-off TV. Don't write a single systemd unit until both work.
3. Log from line one, to somewhere persistent. Most of my debugging time went to scripts that failed silently, and I lost the rest of it to a log in `/tmp`.
4. Suspect `KillMode` any time a service starts a daemon and the daemon's work evaporates the moment the service finishes.
5. Never hardcode a delay you could poll for. Every fixed `sleep` in this script eventually became a bug. The Apple TV fix "worked" for days before the timing drifted.
6. Assume the bus is contested. If anything else on your TV wakes with it, you don't have a timing problem, you have a competitor. Directed standby beats shouting `--active-source` louder.
7. Check `bmAttributes` before you give up on controller wake — and check it on the _Bluetooth radio_, not just the dongle. Mine differed by one bit and that bit was the whole feature.

There's also a community project, [steamos-cec-toolkit](https://github.com/Twsts/steamos-cec-toolkit), that packages CEC volume control, input-inactive suspend, and gamescope recovery behind a Decky plugin. It needs Decky Loader and a working /dev/cec0, so you still need the hardware sorted first, and it's worth reading install.sh before running it since it installs root helpers and a sudoers rule.