# Wishlist

Wishlist is an open source wishlist management web applicaion that allows users to publish their wishlists and reserve items from other users wishlists. The owner of the wishlist will not be able to see which items have been reserved. This solves the issue of the same items being gifted multiple times. Users can add each other as friends and they can also determine if their wishlists should be viewed to everyone, just their friends, or kept private.

The entire project is containerized using docker.

## Backend

The backend is written in node using javascript with express acting as a server. Postgres is used as a database, with knex integrated as a query builder and db migration handler. Tests are done using vitest.

## Frontend

The frontend is written in react using typescript and built with vite. Tanstack query is used to handle asyncrounous state and react router handles the routing. Styling is done with Tailwind. Shadcn is used for UI components. Lucide react and react-icons are used for icons.

## Auth

Passport is used to handle authentication which is based on JWT's with access and refresh tokens. Users can login using either email or their Google account. There are two user roles: Admin, and user.

## Integrated services

The production database and profile pictures are hosted on supabase. Amazon SES is used for sending emails to users, such as account verification and password reset requests.

## Further work:

-   CSRF Tokens
-   Convert backend to Typescript
-   Store tokens in cookie
-   obfuscation of IDs
