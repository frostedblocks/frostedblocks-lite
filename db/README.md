# ICE Lite database

This is the Web2 database for ICE Lite only.

Later:
- ICE Lite DB = email accounts, Lite posts, Lite follows, Lite messages
- ICE Network DB or canister = Internet Identity, on-chain posts
- A bridge table can map `lite_users.id` <-> canister principal when you connect the two

Do not store Internet Identity principals in `lite_users.email`.
