# ICE Network canisters (mainnet)

Used by frostedblocks-lite to read the public feed.

| Role | Canister ID | Used in lite v1 |
| --- | --- | --- |
| ICE backend (posts, profiles, follows) | `6jf55-2qaaa-aaaan-q6mwq-cai` | yes — `getRecentPosts`, `getProfile`, `getPostCategory` |
| Assets / website frontend | `6hhqv-baaaa-aaaan-q6mxq-cai` | look reference only |
| Messaging | `6agwb-myaaa-aaaan-q6mxa-cai` | not yet |
| Factory | `xfwx3-7yaaa-aaaas-qgxpq-cai` | no — provisions personal canisters |
| User site template | `sznn6-uqaaa-aaaas-qgxqa-cai` | no |

Live site: https://frostedblocks.com
Asset canister URL: https://6hhqv-baaaa-aaaan-q6mxq-cai.icp0.io

## ICE backend queries already wired

- `getRecentPosts(n) : [Post]`
- `getHomeFeed(n) : [Post]`
- `getProfile(principal) : ?Profile`
- `getPostCategory(id) : text`

### Post
`{ id; content; reportCount; author; likes; loves; imageURL; isHidden; timestamp }`

### Profile
`{ bio; username; avatarURL }`

Writes (`makePost`, `follow`, `likePost`) stay on-chain. Lite is read + Web2 accounts first.
