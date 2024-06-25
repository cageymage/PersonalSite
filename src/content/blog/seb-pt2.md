---
title: 'SEB Part II - Day To Day'
description: 'Software Engineering Basics Part II'
pubDate: 'June 10 2024'
updatedDate: 'June 10 2024'
heroImage: '/se-basics-blog.jpg'
---

- [Programming vs Developing vs Engineering](#programming-vs-developing-vs-engineering)
- [Language vs Framework](#language-vs-framework)
- [Compiled vs Interpreted languages](#compiled-vs-interpreted-languages)
- [Client vs Server](#client-vs-server)
- [My Three Golden Rules](#my-three-golden-rules)


### Programming vs Developing vs Engineering
- "Programming" is a tad outdated of a term, but can be used to describe simple coding tasks, perhaps something an entry level / beginner developer would do. *Coding* would be the more appropriate term.
    - ex) Write an `if` statement that determines if the user entered the right key
- "Development" or *Software Developer* is a more common and modern term for somebody in their first couple years of experience. It's pretty all encompassing for the tasks associated with working on a Line of Business (LOB) app, personal app, or website. 
    - ex) Adding some new entry fields into a user data form, using a framework to get those user entered values from the webpage or app, and sending the data to an Application Programming Interface (Api).
- "Engineering" or *Software Engineer* is also a common and modern term, but is frequently used in place of Developer or Development. Pedantry aside, this term should be reserved for those in the mid to late stages of their career, and refers to tasks generally associated with higher level architecture of a software product, being an "expert" on one or many systems and subsystems of a product, determining technical best practices, and more.
    - ex) Collaborating on the best solution for solving a pervasive performance problem in a mobile app, breaking down steps to solve in a manageable / reasonable approach, reviewing the actual implementation of the solutions and offering feedback. Most importantly, following up and evaluating the solutions impact, regardless of it 'worked' or not.

### Language vs Framework
- Most modern languages have roots in C, whether or not they are Object Oriented (OO). We call the direct descendents "C derivatives" (like c++, C#, etc). 'Language' and 'Framework' are commonly used in place of each other but are distinctly different. Someone may have used javascript a little so they say they "know React", because React uses a lot of js. That's like saying you know how an internal combustion motor works because you pump your own gas. Not trying to be rude -- trying to clarify the differences between the two vast scopes.
- Breakdown of building blocks
    - Syntax => Language => Toolkit || Framework => Artifact => Deliverable
- Languages
    - C#, Javascript, Python, Java, SQL, Dart, Swift
- What about markup? Well, markup is a *presentation* 'language'. It doesn't do any algorithmic or logical decision making. If you DO see logic in html, it is likely actually the front end framework injecting js or something into it, and not the 
    - Html, CSS, Markdown (.md - like this file!)
    - Caveat!
        - Xml does both document representation AND data serialization. Was created for doc rep, but became the overwhelming choice for data serialization for decades. 
    - Data Serialization - this bears mentioning since we are discussing Xml. Data serialization is a way for one entity breakdown data into a format that can be sent somewhere else, and interpreted back by any other entity. For example, you have a C# desktop app that sends data to an apache web server running its Api in PHP.
        - Json - Much more human readable, modern choice in almost all cases. 
- Frameworks - Yes, there is still some dissent on whether or not Framework is even a real "thing", but the word is so ubiquitously used in the industry, to refer to the same thing, it kinda doesn't matter. Similar to how Xml is both data and document representation. 
    - .NET, Spring, Flutter, etc
    - Web front ends
        - Angular, React, Blazor, Vue, Astro, etc

### Compiled vs Interpreted languages
- Note: there is no hard set rules for either of these concepts, but more so generalities. Case in point - a lot of languages are both compiled and interpreted. This is more of an overview of "traditional" or "mostly correct" definitions.
- Compiled
    - Compiled languages are translated into machine code before they are executed. For instance, a recipe you want to make is in a language you do not know. Someone could interpret the recipe into a language you do know, and write it down, then email or send it to you. You'd have the interpreted recipe, but it would have already been interpreted for you.
    - Languages
        - C++, C#, Go (Golang), Kotlin, Swift
- Interpreted
    - Interpreted languages are only translated into machine code at runtime, as they are executed. In the recipe example above, you would have a person in the room with you, along with the original recipe, interpreting it into your native tongue line by line. 
    - Note: This can have performance impacts, but is generally not something an entry level developer needs to concern themselves with. 
    - Languages
        - Javascript, Ruby, PHP
    - Interpreters
        - CLR, JVM, CPython
    - Scripting
        - Closely related to interpreted languages, and often interpreted. 
        - Javascript, Ruby
        - Caveat - powershell. It is largely used as a scripting language but is powered under the hood by the .NET framework. 
- Both?!
    - Yes. Some languages are considered both. For example, Java is always compiled into byte code, but is run on the JVM - which is a software based interpreter. Python can be compiled to a native program or run in interactive mode as interpreted.
    - Java, Python
- NEITHER!
    - Well what about HTML?? See the [previous section](#compiled-vs-interpreted-languages) about presentation vs programming languages.

### Client vs Server
- Clients
- Servers
- Distributed Systems

### My Three Golden Rules
- Someone has already tried to do what you are trying to do, don't reinvent the wheel!
- The best solution is usually the simplest - "Don't let Perfect be the enemy of Great"
- 