---
title: 'Instructing Copilot'
description: "... And don't call me Copilot"
pubDate: 'July 12 2025'
updatedDate: 'July 12 2025'
subject: 'Tools & Workflow'
heroImage: '/otto-copilot.webp'
---

## "... And don't call me Copilot"

<br/>

### Disclaimer
I am not an "AI guy". I am writing this for myself, and maybe other senior devs out there who may be looking to understand some of the basics of AI code gen using copilot. Please, miss me with any "why didn't you talk about X", "pffft, copilot?! how are you not vibing an entire project?" or "wut a noob". Believe me, I know... I'm the one who has to live with myself! I get it!

### Inspiration
A recent-ish [Hanselminutes](https://podcasts.apple.com/us/podcast/hanselminutes-with-scott-hanselman/id117488860) podcast [episode](https://hanselminutes.com/996/is-vibe-coding-real-with-james-montemagno) with guest James Montemagno. Episode featured in depth discussion about "vibe coding" that was interesting but the real take away was how James uses Github Copilot to quickly stand up new methods, features or entire services based on his own coding standards or "instruction prompts". This was achieved through using plain text english in MD files to instruct Copilot and give the necessary context to any generated responses and code. Context includes things like project structure, blazor / front end (css, themes, etc) guidelines, coding style (preferring async/await, "var" instead of explicit types, etc), component structure (reusable logic into services, small and focused components, etc) and testing / performance / documentation, etc.

Since most LLMs require 'good' context to give 'good' answers, it is daunting to consider using Copilot to generate code in a codebase. Single line "better auto complete" is easy, because the AI has all the context it needs already (surrounding code, method signature, etc). But what about wiring up a new endpoint? That requires a lot more thought and context. What services will the endpoint need -- are they already dependencies to the controller or do we need new one(s)? What kind of repositories do those services need? Do they exist already? And finally, what kind of providers do the repositories need? Existing data stores? External resources? How would Copilot even know thats (Controller -> Service -> Repository -> Provider) the preferred pattern when creating new endpoints? 

Perhaps we pose a different question: *How do YOU know what the preferred patterns are?*

### Why use Copilot?
Similar to how humans work, Copilot / LLMs work best when given plenty of context. They are far quicker to consume text than a human, but can require much more context to make sense of what they consumed (we've all had an experience with AI 'hallucinating' an answer, I'm sure). Think about having to give enough or 'the right' context to Copilot every time you wanted to generate some classes / code / architecture beyond the scope of your current method. You'd have to keep saying "given X feature's classes relationship and componentization, generate me Y new classes with similar relationships, with Z interfaces. Prefer async/await in all signatures and avoid using Task.Anything, include top down behavioral tests similar to ABC test suite.". Every. Single. Time.

So, in the [immortal words of Homer Simpson](https://www.youtube.com/watch?v=GZOuz-SG7-g) running for sanitation commissioner: "Can't someone else do it?" Yes -- they can! That's right -- those dusty old coding standards documents you were lazily pointed to during onboarding can be used to prompt Copilot automatically in your codebase, and it's as simple as adding a file or two to a directory. Now, new or just-new-to-the-repo developers can spin up features and code much easier while ensuring they are adhering to standards. Especially beneficial to new devs or those just new to the codebase. Another benefit: now your standards docs are under source control -- so you can be VERY specific to the codebase, and see change over time. 

### How it works
Copilot will use .md supporting files whenever it is being given instructions automatically (provided they are in the `.github` directory). Additionally, a subfolder called `.github/prompts` where you manage .md files of specific prompt context and instructions will be used when generating specific components you have pre-defined. 
- :lightbulb: If you are wondering what a .md file is (spoiler alert: this doc is written in md!), or don't have a lot of familiarity with markdown, there are [plenty of resources](https://www.youtube.com/watch?v=_PPWWRV6gbA&t=60s) online.

For instance, if your repo is a .NET MAUI app, you can add high level instructions like coding style (no logic in constructors, only dependency setting, etc) into `copilot-instructions.md` and specific component creation (like ViewModels - prefer using CommunityToolkit.Mvvm attributes for property and command binding) in `/prompts`. 


### Setup
Assuming you are using github, you should have a `.github` directory in the root of your solution. Create a new file in there called `copilot-instructions.md`. 

<br/>
Start with some simple highest level possible context -- for instance, the technical name as well as the product name that the solution represents, the remote url of the repo, and a one liner statement about its intention and focus. 

```
# Copilot Instructions
This is the solution repo MyCompanyOrName.TryingSomething1, but the actual product name is 'Cool New Thing'. The repo is sourced from https://github.com/myCompanyOrName. This product aims to provide users with the newest coolest thing!
```

<br/>
Next, you'll likely want to give context about how the projects are structured. 

```
## Project Structure
- the main source directory is src
- some folders, projects and namespaces are called TryingSomething1, but the preferred name is MyCompanyOrName.someProduct
- /src/TryingSomething1 is the main project. It houses all the html/css/xaml, classes and platform code. It is also the main website project.
```

<br/>
I won't list everything you will want to put in your document, but perhaps some coding style generalities are also helpful

```
## Code Style
- Prefer using async/await for asynchronous operations
- Prefer async/await over direct Task handling
- Use nullable reference types
- Use var over explicit type declarations 
- Always implement IDisposable when dealing with event handlers or subscriptions
```
<br/>
Now, let's do something more specific. Let's provide some context and guidelines for generating more complicated code than just a single line or two, or a refactor. This example is generating a new ViewModel, for us in a .NET MAUI app.

First, we set up some context like the expected inputs, or purpose of the new ViewModel you want to build. Then, we define our baseline 'type' of ViewModel we want. That helps Copilot put it somewhere in our solution that makes sense, and namespace it accordingly.

```
# New ViewModel Implementation Guide

- This guide outlines the steps needed to implement a new viewmodel across the MyCompanyOrName.TryingSomething1 solution. Use this as a checklist and reference for adding any new view model, whether a Control or View. Adjust steps as needed for your specific scenario.
- Your inputs need to be ViewModel Type, `ViewModelName`, and optionally `ParentFeature` (required if the new viewmodel is not a core dependency)

---

## 0. Determine ViewModel Type
- Is this a **Control** viewmodel (something shared between multiple views like a drop down or text input)?
  - Place under `Controls/` and name file `{ViewModelName}ViewModel.cs`
- Is this a **View** viewmodel (content view that uses various controls to enable user facing features)?
  - Is this a core dependency like AppShell?
    - Place under the root `Views/` and name file `{ViewModelName}ViewModel.cs`
  - Is this user facing feature like SomeListOfThings or Home?
    - Is this an existing feature -- does `{ParentFeature}` match any directories in `Views/`
      - Place under `Views/{ParentFeature}/` and name file `{ViewModelName}ViewModel.cs`
    - If this is a new feature -- does `{ParentFeature}` not match any directories in `Views/` 
      - Create a new directory under `Views/` named `{ParentFeature}`
      - Place under `Views/{ParentFeature}/` and name file `{ViewModelName}ViewModel.cs`
```

<br/>
Next, let's define some specifics around what we expect in any baseline ViewModel along with any related entities (models, services, etc) that need to be created.

```
## 1. Entities and Types
- [ ] Add new entities and types to `Views/{ParentFeature}/`. File and class names can be `{ViewModelName}ViewModel.cs`
- [ ] Any entity properties that will be bound to a View should be marked as `BindableProperty` from `CommunityToolkit.Mvvm`

## 2. Service-Specific Data Fetcher
- [ ] Services are location in `Services/`. Determine if a new service is required based on similar naming and conventions or related features
    - [ ] If a new service is required, add it to `Services/{ParentFeature}/` and name the file `{ViewModelName}Service.cs`
- [ ] Use async/await, nullable reference types, and error handling (only use Warning level)
- [ ] Add logging using TelemetryService.LogInformation 

## 3. View Bindings
- [ ] All commands / button bindings are bound to the viewmodel with `RelayCommand`s, from `CommunityToolkit.Mvvm`
- [ ] All properties that are bound to the viewmodel should be in CamelCase and use a simple get/set property pattern
- [ ] Any list properties intended to be bound to a CollectionView should be of type ObservableCollection<T>
```

### So what now?
Now that you have some basic instructions, give it a try! Open a copilot prompt and ask the agent to generate a new ViewModel with some basic inputs like... its a view type, and the feature it will be a part of is SomeNewFeatureLikeSearch. It's content view will have a text entry field, a button to initiate the search, and use the existing SearchService to search using the text input's text. See what Copilot generates!
- :lightbulb: Depending on what IDE you are using, you may get mixed results for Copilot's output. If you are using VS2022 17.13.x or lower (it seems that Agent mode is coming to VS2022 17.14.x), you will have to accept that Copilot will only generate text for you, and its up to you to copy that into files and utilize. If you are in VSCode however, you have the option of being in `Ask`, `Edit` or `Agent` mode. `Agent` mode is the most free wheeling, where Copilot will do anything you ask it to (add, edit or delete files, use the file system for reference, etc) and is likely for more confident developers. `Ask` is like VS2022 and will only generate text, and `Edit` is for small, specific changes like a single file. 

There's a lot more you can do with Copilot, I only wanted to go over the basics of guided code generation to help ease the (warranted) concerns of developers. 


### Resources
- James Montemagno's [personal github](https://github.com/jamesmontemagno), specifically the [FeedbackFlow repo](https://github.com/jamesmontemagno/feedbackflow/blob/main)
- Scott Hanselman's podcast [Hanselminutes](https://www.hanselminutes.com/), specifically the ["Vibe Coding" episode](https://hanselminutes.com/996/is-vibe-coding-real-with-james-montemagno)
- Microsoft Docs
    - [Adding custom instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)
    - [Getting better results](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context?view=vs-2022)