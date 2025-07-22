---
title: 'Natively Reacting - WIP'
description: 'Just what we need, another React-ion'
pubDate: 'Feb 12 2025'
updatedDate: 'Feb 12 2025'
heroImage: '/react-native-logo.png'
---

# WIP

## "Just what we need, another React-ion"

As mentioned, in my day job I develop primarily in .NET, notably MAUI cross platform ("xplat") for our main client app. Since this is all built on .NET, with XAML being the presentation markup, my background as a WinForms & WPF developer was a natural transition. Additionally, my first experience with mobile was actually Xamarin Native (before MS bought it, predecessor to Xamarin Forms, predecessor to MAUI), which we later transitioned to Swift since Android wasn't a strategic goal for the org. Getting to understand the mobile ecosystems deeper, I started seeing more xplat frameworks and toolkits that had matured in the time since Xamarin Native, giving credence to xplat development being a real strategy for many developers, from the hobbyist to the titan orgs of tech. With React Native having an [estimated 30%+](https://www.statista.com/statistics/869224/worldwide-software-developer-working-hours/) market share of xplat frameworks, I decided to see what the fuss what all about, and add my reactions to a *certainly* not overcrowded hot take pool. 

### Getting set up
The first boss I encountered was how to get started, in particular as an accomplished engineer familiar with, but not an expert in, JS and react. Add to that my knowledge of xplat development, which should have made things easier but alas, it kinda didn't. Should I start with Windows? I also have MacOS... What IDEs support not only code development, but any debug or run time options? iOS can be a walled garden for xplat development -- how would this dev env deal with provisioning and signing? Does the Android emulator play nicely? After spending a few hours reading reddit, I landed on a post from a professional mobile developer with a (seemingly) large amount of xplat experience. [Their blog](https://343max.de/posts/the-perfect-react-native-dev-setup/) contained enough information for me to make a decision: 
- Expo for IDE / build platform
    - Despite having a storied past, it seemed like people now prefer Expo to other IDEs
- MacOS for dev machine
    - Having a MacOS device that can run an iOS simulator seemed to be more straight forward approach. Unlike VS2022, most other xplat toolkits cannot deploy directly to an iOS local device
    - A few other posts talked about how most Expo help posts assumed you were working on MacOS

Thus begins my journey!
- install nodejs
    - terminal
        - ```brew install node```
        - ```node -v``` make sure it installed and you get a version!
    - https://nodejs.org/en/download
- setup new project via expo docs
    - connect github 
        - setup new repo - have to allow all or create a new one before
        - setup new project - does this create a new repo?? it wouldnt let me use the existing one i created before connecting gh
        - follow setup steps in browser, will eventually be taken back to terminal
        - managing git creds - i used git-credential-manager, made it very easy
            - https://docs.github.com/en/get-started/getting-started-with-git/caching-your-github-credentials-in-git
    - or dont
    - 