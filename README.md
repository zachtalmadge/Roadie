# Roadie

Roadie is a MERN application that allows end-users to browse through a catalog of <b>Music Festivals</b> while learning more about performing <b>Artists</b>. 


## Overview
The Music Festival industry is wide ranging and diverse, spanning all across the US and the world at large. There are festivals of all types but some of the most popular are of the Electronic Music genre. A large number of attendees will go to more than one event per year, if not several. Roadie is the perfect app for these festival-goers to use when planning out their next event. Roadie provides information on who, what, when and where these events are happening around the country. In addition to that, Roadie helps music lovers discover new artists. Roadie accomplishes this by showcasing their most up-to-date releases and associated labels. This will in turn encourage attendence at more events as users will want to see these new-found artists perform live.


## Technologies Used

  - Mongoose
  - Express
  - React
  - Node
  - Semantic UI
  - Bootstrap for React

---

## Installation

1. Open a terminal in the <b>client</b> folder and run:
```sh
$ npm install
```

2. Open a terminal in the <b>server</b> folder and run:
```sh
$ npm install
```

3. Open a terminal at the root level of the project and run the following commands: 
<br><b>(Make sure you have a MongoDB instance running before you do this!!)</b>
```sh
$ mongoimport --db roadie --collection artists --drop --file ./data/artists.json
```
```sh
$ mongoimport --db roadie --collection festivals --drop --file ./data/events.json
```

```sh
$ mongoimport --db roadie --collection users --drop --file ./data/users.json
```
4. Switch back over into the terminal that is in the <b>server</b> directory and run 
```sh
$ npm start
```

5. Finally, in the terminal that's located in the <b>client</b> directory run:
```sh
$ npm start
```

## Acknowledgment
Thank you to The Last Mile for providing me with the education, tools and resources to learn WDF and MERN. This has been an amazing journey from day 1. Roadie was hands down my most favorite project. I attended dozens of music festivals and a couple hundred concerts in my party days so I had to stick with what I knew. I was so into this project that I was upset every time I had to leave class! What I really learned from all this is that when I seek employment in Web Development I need to pursue a company that I can really put my heart and passion behind because if I am successful at that then the potential at what I could contribute there is endless.

## - Zachary Talmadge
>If programming is the ocean I feel like I've only dipped my toe in the water.