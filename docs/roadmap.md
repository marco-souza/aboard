# Development Roadmap

- "Maybe ?" centered board
- Clean and focused UI/UX
- Fully responsive design for mobile and tablet

## Minimum Lovable Product (MVP)

- [ ] Omni Menu
  - [ ] Headers (Company name)
  - [ ] Headers (Omni search)
  - [ ] Home, Assigned to me, Added by me+
  - [ ] > Boards
  - [ ] > People
  - [ ] > Settings
  - [ ] Footer (Aboard is designed, build and backed by TremTec)

- [ ] Boards
  - [ ] Create a board from the Omni Menu
  - [ ] Board Settings page
    - [ ] [col 1] Board name
    - [ ] [col 1] Members (filter by name, email)
    - [ ] [col 2] Auto Close settings
    - [ ] [col 2] Share Settings - toggle public/private link
    - [ ] [col 2] Button Delete Board (with confirmation)

- [ ] Lanes/Columns
  - [ ] Start with 3 columns: "Not Now", "Maybe?", "Done"
  - [ ] "Maybe?" column will be always expanded, with a fixed card at the top
    - [ ] Button - Add card [C]
    - [ ] Watching for new Cards - list of members
    - [ ] Button - Stop/Start Watching for new Cards
  - [ ] Allow users to allow adding/removing columns
    - [ ] popup requesting name and color
  - [ ] Draggable cards between lanes/columns (even when collapsed)
  - [ ] Collapsible lanes/columns
  - [ ] Besides "Maybe ?", user can only 1 lane/column open at a time
  - [ ] Zoom View - a Flex-centered list of all tickes in a lane

- [ ] Cards
  - [ ] are associated with a lane/column
  - [ ] title, desscription, author, assigned user
  - [ ] When we click the card, it opens a dialog
  - [ ] CardDialog should have 2/3 col as content, and 1/3 as sidebar
  - [ ] CardDialogSidebar must list the lanes

- [ ] Users
  - [x] Register/Sign-in with OpenAPI
    - [x] set up backend
    - [x] Set up OAuth2 (github, google)
  - [ ] Create boards and invite other users and groups
  - [ ] Create groups and add members to them
  - [ ] When invited to a board, users will be altomatically watching it

- [ ] ...
