---
name: docker-dev
description: Use when running SuperChat via Docker — first-time host setup, make dev/prod/down/reset commands, service URLs and ports, or hot-reload behavior.
---

# Docker Dev Workflow

First add `127.0.0.1 superchat.test` to `/etc/hosts`, then:

```bash
make dev    # first run copies .env.example → .env; fill in values, then re-run
make prod   # production build (nginx serves compiled bundle)
make down   # stop all containers
make reset  # stop + destroy all volumes (full reset)
```

**Development** (`make dev`) — hot reload, source volume-mounted:
| Service | URL |
|---|---|
| Frontend + API | https://superchat.test (nginx → Vite HMR + NestJS watch) |
| phpMyAdmin | http://localhost:`<PMA_HOST_PORT>` |
| MySQL | internal only |

**Production** (`make prod`) — optimised compiled builds:
| Service | URL |
|---|---|
| Frontend + API | https://superchat.test (nginx → built bundle + compiled Node) |
| phpMyAdmin | http://localhost:`<PMA_HOST_PORT>` |
| MySQL / Backend | internal only |

> Hot reload: `backend/src` and `frontend/src` are volume-mounted in dev — changes take effect instantly without restarting Docker.
> `VITE_*` variables are baked into the JS bundle at build time. Changing them in prod requires `make prod` (rebuilds the image).
