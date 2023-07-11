# Testudo-Revamp

## Accessing the Service Online

We have deployed the web service using Render.com. You can visit us at [testudo2-0.onrender.com](https://testudo2-0.onrender.com).

## Running the Server Locally

You are able to run this server locally on your computer using NodeJS. Start by extracting the contents of this file and run the following commmand within the directory.

```shell
npm install
```

This will install all the modules required for Testudo-Revamp to run properly. The next step is to simply start the server locally by running

```shell
node index.js
```

The server can be accessed at [localhost:3000](http://localhost:3000).

---
 
## Welcome to the Revamped Version of Testudo

<img src="https://raw.githubusercontent.com/SamAdrn/Testudo-Revamp/main/public/screenshots/home-page.png" alt="Home Page" width="500">

To view a live demo of our project, check out this [YouTube Video](https://youtu.be/HxArLlzoiEo).

The goal of this project is to make viewing class schedules a lot easier, with a new minimalistic design and additional tools to help make faster decisions for course registrations. As a reference, this is what the current Schedule of Classes service that we students use looks like:

<img src="https://raw.githubusercontent.com/SamAdrn/Testudo-Revamp/main/public/screenshots/ancient-testudo.png" alt="Home Page" width="500">

The project aims to improve this interface such that it is able to reflect the great quality of education that students of the University of Maryland receives. This is a WIP, but so far, we've implemented some of the core functionalities, as described below:

---

### Searching for Courses

<img src="https://raw.githubusercontent.com/SamAdrn/Testudo-Revamp/main/public/screenshots/search-bar-home-page.png" alt="Search Bar at Home Page" width="400">

The website retrieves results based on the user's search query. This must be a keyword related to the full course name. For example, typing in `CMSC` will show all the courses provided by the UMD Computer Science department, and typing in `engineering` will show all courses that has the keyword 'engineering' in its name.

The user will then be redirected to another page where they are able to see more information about each specific course, from the course description, credits, and restrictions that students should know about; to the sections available, seating availability, and meeting locations.

<img src="https://raw.githubusercontent.com/SamAdrn/Testudo-Revamp/main/public/screenshots/search-results.png" alt="Search Results" width="500">
<img src="https://raw.githubusercontent.com/SamAdrn/Testudo-Revamp/main/public/screenshots/sections.png" alt="Home Page" width="500">

Users can also minimize their search results through a Sort/Filter off-canvas page on the right. Sort them by credits, or filter them by gen-ed type.

<img src="https://raw.githubusercontent.com/SamAdrn/Testudo-Revamp/main/public/screenshots/sort-filter.png" alt="Home Page" width="500">

Need to make another search? Access the search bar through the little arrow button on the left.

<img src="https://raw.githubusercontent.com/SamAdrn/Testudo-Revamp/main/public/screenshots/search-bar-offcanvas.png" alt="Search Bar Offcanvas" width="400">

More features will be integrated in the future.

---

### Saving Courses

You can also add your favorite courses for later access, by clicking on the cute little star button on the right side of each section.

<img src="https://raw.githubusercontent.com/SamAdrn/Testudo-Revamp/main/public/screenshots/favorites-star.png" alt="Favorites Star" width="400">

Your favorite courses can then be accessed through the Favorites page accessed at the top navbar.

<img src="https://raw.githubusercontent.com/SamAdrn/Testudo-Revamp/main/public/screenshots/favorites-page.png" alt="Favorites Page" width="500">

---

### Credits

This project would not be possible without [UMD.IO](https://beta.umd.io/)'s wonderful API, and our beloved instructor [Nelson Padua-Perez](https://www.cs.umd.edu/~nelson/).

And of course, to the people that collaborated into this project:

- [Samuel A. Kosasih](https://github.com/SamAdrn) (samadrn)
- [Nathan Bezualem](https://github.com/nathanb9) (nathanb9)

[Bootstrap v5.2](https://getbootstrap.com/) was used to create this design, and [MongoDB](https://www.mongodb.com/home) as a back-end database.

---

### Known Issues

1. Home page is very icky right now. There is a lot to do about the design to make it even more beautiful.

2. Course search results may be out of sync with Testudo. This might be an issue with UMD.IO's scraper [github.com/umdio/umdio/issues/241](https://github.com/umdio/umdio/issues/241).

---

> Written [12/14/2022]
