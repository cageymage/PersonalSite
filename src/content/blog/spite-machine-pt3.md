---
title: 'The Vapor Chamber Part 3: The Performance of a life time'
description: 'Spitefully Building a TV Gaming PC'
pubDate: 'August 07 2026'
updatedDate: 'August 07 2026'
subject: 'Hardware and Hobbies'
order: 2
heroImage: '/blog-images/latte-larrys.jpg'
---

So, what has this all taught me? 
- When you are working with ITX / small form factors, be prepared to take everything apart multiple times
  - It's not a failing on you, its just hard to work in real tight areas! Meaty human fingers aren't precision instruments that machines require!
  - I would recommend a nice precision screwdriver set, that is also magnetic. The number of times I had to stick my screwdriver down into a chasm to find the hole made me real happy mine was _slightly_ magnetic.
- If you are working with a new piece of hardware you haven't had previous experience with, it's a good idea to do a little research before hand. If I had known how sensitive the GPU riser cables are, along with my particular mobo, it coudld've saved me hours and hours. 
- It's fun to document things and then write about them! Trust me -- there are weirdos out there who love building, painting, writing, and creating things that are just as weird as you! Dear Reader, you might be one those weirdos out there -- and I salute you o7
- 4K is a big performance hit over 2K / 1440p. Most of the last decade of my gaming has been on my PC @ 1440p, so I was unprepared for how to configure a card and games for a 4K TV. When I saw 30FPS at Ultra+RayTracing in CP2077 I thought something was wrong with my build. Nope, its just asking a lot of a game and GPU. 

I'll leave with one last thing here -- as a software engineer, I really push to know if our changes are actually effective. Did our optimization to shell navigation in our mobile app actually have the performance increase we desired? Once we added another node to our read replica DB, did our read times go down?

So, I'll keep adding here as I continue to test, but here are the benchmarks I've collected so far!

* I'm currently using High @ 4K and am happy with the ~110 FPS

### Performance Testing
All testing done on a Samsung 77in S90C 
<table border="1">
  <tr>
    <th>Setting</th>
    <th>Resolution</th>
    <th>Game</th>
    <th>FPS</th>
  </tr>
  <tr>
    <td>Ultra + Ray Tracing</td>
    <td>4K</td>
    <td>Cyberpunk 2077 (in-game benchmark)</td>
    <td>30-35</td>
  </tr>
  <tr>
    <td>High + Ray Tracing</td>
    <td>4K</td>
    <td>Cyberpunk 2077 (in-game benchmark)</td>
    <td>40-45</td>
  </tr>
  <tr>
    <td>High</td>
    <td>4K</td>
    <td>Cyberpunk 2077 (in-game benchmark)</td>
    <td>110</td>
  </tr>
  <tr>
    <td>Medium</td>
    <td>4K</td>
    <td>Cyberpunk 2077 (in-game benchmark)</td>
    <td>120-130</td>
  </tr>
  <tr>
    <td>Ultra + Ray Tracing</td>
    <td>2K</td>
    <td>Cyberpunk 2077 (in-game benchmark)</td>
    <td>40-45</td>
  </tr>
  <tr>
    <td>High + Ray Tracing</td>
    <td>2K</td>
    <td>Cyberpunk 2077 (in-game benchmark)</td>
    <td>50-55</td>
  </tr>
  <tr>
    <td>High</td>
    <td>2K</td>
    <td>Cyberpunk 2077 (in-game benchmark)</td>
    <td>120</td>
  </tr>
  <tr>
    <td>Medium</td>
    <td>2K</td>
    <td>Cyberpunk 2077 (in-game benchmark)</td>
    <td>171</td>
  </tr>
</table>