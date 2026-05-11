# GDPR and Compliance Principles for Apps

## Purpose of the App

The app helps users find potentially interesting posts in public sources, such as public Facebook groups.

The app is not a database of posts, authors, profiles, or comments.

--

## What the App Can Do

The app can:

- analyze publicly available posts only to assess whether they match the user's goal;
- temporarily process the post content for AI classification purposes;
- save a link to the post;
- save information about whether the post matches the user's goal;
- save a match score, e.g., `score`;
- save a match category, e.g., `buying_intent`;
- save a simple reason code, e.g., `explicit_purchase_intent`;
- save the source, e.g., a link to a public group;
- save the date of detection;
- delete old results after a specified period;
- Show the user a link to the post and basic classification metadata.

--

## What the app can store

The app can store only the minimum data needed to run the service:

- `user_id`;
- `post_url`;
- `source_url`;
- `score`;
- `category`;
- `reason_code`;
- `detected_at`;
- `expires_at`;
- a technical hash for deduplication if it doesn't allow for reproducing the post content.

--

## What the app cannot do

The app cannot:

- store the full content of posts;
- store post summaries;
- store quotes from posts;
- store the author's data;
- store links to author profiles;
- store profile photos;
- store comments;
- store reactions, likes, or shares;
- create a database of people;
- create profile databases;
- enrich leads with private data from individuals;
- monitor private or closed Facebook groups;
- download content that requires login;
- use users' Facebook accounts;
- store cookies, session tokens, or Facebook passwords;
- circumvent Meta security;
- conceal the automated nature of application operation;
- save raw data from downloaded posts in logs, cache, analytics, or error systems.

--

## AI Policy

AI may assess whether a post is relevant to the user's purpose.

AI may not generate or save:

- a post summary;
- a quote from the post;
- author information;
- contact information;
- personal data found in the post content;
- the full post content.

AI results should be limited to information such as:

- match/not match;
- match score;
- category;
- simple reason code.

---

## Facebook Policy

The app must only work with publicly available sources.

The app must not work with:

- private groups;
- closed groups;
- content accessible only after logging in;
- content requiring group membership;
- content obtained using an account, cookies, or user sessions.

--

## Data Minimization Policy

The app should store as little data as possible.

The most important rule:

> We store the link and classification metadata, but we do not store the post content or author information.

--

## Data Retention

Results should be stored only for as long as needed by the user.

By default, results should be deleted after a short period, e.g., 30 days.

Without further justification, the app should not store results longer than 90 days.

--

## Product Communication

The app should clearly inform the user that:

- it only analyzes public sources;
- does not support private groups;
- does not store post content;
- does not store author data;
- only displays links and classification metadata;
- the user is responsible for the lawful use of the results found.

--

## Brief Summary

The application can:

- temporarily analyze public posts;
- assess their relevance to the user's purpose;
- save a link to a post;
- save the classification result.

The application cannot:

- store post content;
- store author data;
- analyze private groups;
- use Facebook accounts or sessions;
- create databases of personal information.

The most important rule:

> Link + classification is allowed. Post content and author data are not allowed.
