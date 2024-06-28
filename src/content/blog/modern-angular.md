---
title: 'Trip Down Angular Lane'
description: 'Back in my day, Angular had a JS in it!'
pubDate: 'Jun 25 2024'
updatedDate: 'Jun 28 2024'
heroImage: '/angularjs-angular.jpg'
---

## "Back in my day, Angular had a JS in it!"

Someone in the community recently had need of some beginner resources and mentorship for getting into software engineering (which inspired [my recent multi-part blog](/blog/software-engineering-basics)), and I recommended starting with a web front end framework & tutorial. I know this may not _seem_ like the best place to start, but I have [my reasons](/blog/seb-pt4). Anyways, I looked to my old friend AngularJS for inspiration, as it was the first web front end tech I started with (although I already had a number of years of desktop experience). 

I knew Angular has had multiple iterations and major version changes since I first used it back in 2015 -- and I could never keep track of the versioning anyways, but since so much time had passed I figured many more resources would be available for learning than what we had (a consulting company who used the same templated code for every job, which didn't confuse us at all when we took over the code base 🙄).

The community member tracked down a series of youtube shorts (each < 15m!) from the [Angular channel](https://www.youtube.com/playlist?list=PL1w1q3fL4pmj9k1FrJ3Pe91EPub2_h4jF). While I did not watch them all and cannot speak to the material presented, I did think having a [Senior Dev Relations Engineer](https://io.google/2022/speakers/mark-thompson/) as the presenter was certainly a good idea and made for a great instructor! The [sample repo](https://goo.gle/learn-angular-step-1) they worked out of was a relatable product (Housing search app), and touched on many of the basic components and seemingly simple concepts that we tenured professionals take for granted. The readme was easy to follow to get started up, and after installing the [angular cli](https://www.npmjs.com/package/@angular/cli) all I needed to do was hit npm with an install, then fire up the local runner. A far cry from the many steps we needed to do back in the day! It was clear this new age of Angular (2+?) had quite a bit more maturity under its belt than AngularJS -- ease of installation, no more $scope (yay!), "[ ]" for properties and "( )" for events, etc. 

One thing I would be remiss to not mention was the fact that this tutorial-level-sample-app had component level spec tests already framed up. Talk about setting up new (or returning!) developers for success. They use jasmine by default, which I had no experience with, but after about 10m of looking into the different operations available to me, I was able to given/when/then my way into a couple sweet component level tests. Side note: this was also some of my first experience with TypeScript, which I quite enjoying coming from a (mostly) .NET / C# background.

Conclusions -- I really enjoyed working with Angular in a non-professional setting, which was a far cry from the business SPAs I was writing in AngularJS almost a decade ago (yikes...). Being later in my career and more focused on quality and automation made me appreciate the attention to testing being shown to developers, and the simple "get up and running" of a few cli commands really had me beaming, which inspired this blog. Thanks for reading!