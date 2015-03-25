var express = require('express');
var router = express.Router();

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();
  // if they aren't redirect them to the home page
  res.redirect('/auth');
}

router.get('/', isLoggedIn, function (req, res, next) {
  // TODO Request the list of people to an endpoint;
  // For now, just mock it.
  var batches = [{
    "id": 17,
    "name": "Spring 1, 2015",
    "start_date": "2015-02-16",
    "end_date": "2015-05-07"
  }, {
    "id": 15,
    "name": "Winter 2, 2015",
    "start_date": "2015-01-05",
    "end_date": "2015-03-26"
  }, {
    "id": 2,
    "name": "Fall 2011 (aka Batch[1])",
    "start_date": "2011-09-27",
    "end_date": "2011-12-15"
  }, {
    "id": 1,
    "name": "Summer 2011 (aka Batch[0])",
    "start_date": "2011-07-18",
    "end_date": "2011-08-18"
  }];

  res.render('contacts', {
    batches: batches
  });
});


router.get('/:id', function (req, res, next) {
  // TODO Request the list of people to an endpoint;
  // For now, just mock it.
  var people = [{
    "id": 739,
    "first_name": "Michael",
    "middle_name": "Robert",
    "last_name": "Arntzenius",
    "email": "daekharel@gmail.com",
    "twitter": "arntzenius",
    "github": "rntz",
    "batch_id": 11,
    "phone_number": "412 426 0065",
    "has_photo": true,
    "bio": "I'm a PhD student at CMU, currently on a year's leave of absence. I like programming languages and systems - OS kernels, database engines, distributed systems, GCs, language runtimes, that sort of stuff.\r\n\r\nI'm language-agnostic; I know many and I will learn more. I like functional programming but I've worked on imperative codebases. The problem and the techniques are what most interest me; language, style, framework are secondary.\r\n\r\nI'm willing to move. I'm probably heading back to academia in a year, so primarily looking for an internship, but could be convinced otherwise. ",
    "is_faculty": false,
    "is_hacker_schooler": true,
    "job": "Student at CMU",
    "skills": [
      "c",
      "python",
      "haskell",
      "compilers",
      "scheme",
      "lisp",
      "teaching",
      "systems",
      "logic",
      "category theory",
      "pl",
      "agda",
      "twelf"
    ],
    "image": "https://d29xw0ra2h4o4u.cloudfront.net/assets/people/michael_robert_arntzenius_150-21a09ceae17a00f836731acf81d3c467.jpg",
    "batch": {
      "id": 11,
      "name": "Summer 1, 2014",
      "start_date": "2014-06-09",
      "end_date": "2014-08-28"
    },
    "projects": [
      {
        "title": "Monoidally extensible syntax",
        "url": "https://github.com/rntz/mloid",
        "description": "I'm working on creating a simple functional language with extensible syntax - where you can import a module and suddenly you have regex literals, or an object system, or new pattern-matching constructs, or the ability to embed SQL, etc.\r\n\r\nThe core idea is to use monoids to structure extensibility. You can read a little more here: http://www.rntz.net/post/2014-06-27-monoids-scope-extensibility.html\r\n\r\n(It's not a lisp; this isn't a macro system. It is kinda like reader macros on steroids, though.)"
      }
    ],
    "links": [
      {
        "title": "www.rntz.net",
        "url": "http://www.rntz.net"
      },
      {
        "title": "github",
        "url": "https://github.com/rntz/"
      }
    ]
  }, {
    "id": 736,
    "first_name": "Nava",
    "middle_name": "",
    "last_name": "Balsam",
    "email": "nava00@gmail.com",
    "twitter": "",
    "github": "nava00",
    "batch_id": 11,
    "phone_number": "",
    "has_photo": true,
    "bio": "I enjoy the kind of programming that involves analytic and quantitative thinking.\r\n\r\nI'm currently in my last year of a PhD program in pure math at Columbia University and I have an undergraduate degree in EE where I focused on signal processing. At hacker school I learned to use tools beyond Matlab and Mathematica, and I am most comfortable in python. \r\n\r\nI enjoy working on problems with a mathematical bent but I have worked on a variety of projects in order to broaden my skills and they have been a lot of fun.",
    "is_faculty": false,
    "is_hacker_schooler": true,
    "job": "Student at Columbia University",
    "skills": [
      "javascript",
      "python",
      "math",
      "matlab",
      "mathematica",
      "basic signal processing"
    ],
    "image": "https://d29xw0ra2h4o4u.cloudfront.net/assets/people/nava_balsam_150-1fffd1f4d95c7358707bd074225c2c45.jpg",
    "batch": {
      "id": 11,
      "name": "Summer 1, 2014",
      "start_date": "2014-06-09",
      "end_date": "2014-08-28"
    },
    "projects": [
      {
        "title": "Snake",
        "url": "https://nava.iriscouch.com/snake/snakeID/snake_container.html",
        "description": "I am writing the classic game 'snake' as a way of learning javascript.\r\n\r\nThe game is hosted on iriscouch.com and I hope to soon have a working high score feature."
      },
      {
        "title": "Mazes and Percolators",
        "url": "https://github.com/nava00/maze",
        "description": "This project involves various maze solving techniques including recursive, and breadth-first searches. I also compiled statistics concerning randomly generated mazes of various sizes.\r\n\r\nA percolator is similar to a maze: the entire top row is the starting spot and the entire bottom row is the ending spot. Percolators demonstrate very surprising behavior: see the percolator.png image."
      },
      {
        "title": "Square Game",
        "url": "https://github.com/nava00/square_game",
        "description": "A simple game written in python, using pygame for the graphics and control flow. The human and computer take turns placing tokens on a square grid and receive points when a square is formed from any 4 of the tokens.\r\n\r\nThe game is fitted with a mini-max AI which is very hard to beat!\r\n\r\nThis project is a collaboration with Raymond Zeng."
      },
      {
        "title": "FFT Compressor",
        "url": "https://github.com/bornreddy/FFT",
        "description": "A simple lossy image compression scheme based on the FFT. The 2d FFT and inverse FFT were written from scratch. This project is written in python and is a collaboration with Marisa Reddy. "
      },
      {
        "title": "License Plate Reader",
        "url": "https://github.com/itwasntandy/numberplate",
        "description": "We are using the openCV libraries and python to write a program that finds and reads all license plate in an image. \r\n\r\nThis project is in collaboration with the talented Andrew Mulholland."
      },
      {
        "title": "Simple Ray Tracer",
        "url": "https://github.com/nava00/ray",
        "description": "A simple ray tracing example written in python. "
      },
      {
        "title": "Machine Learning with Handwritten Numbers Dataset",
        "url": "http://coming soon",
        "description": "This is an open-ended project where I try to cluster or otherwise classify the dataset using various descriptors that I think of, or hear about. So far, nothing works as well as the neural network with just the pixel descriptors."
      },
      {
        "title": "Perceptron",
        "url": "http://coming soon",
        "description": "A perceptron learning algorithm to find a dividing line between linearly separable data in two dimensions. The program displays the progress at various iterations and also a graph to visualize convergence. I discovered different behaviour if the points are shuffled in each iteration. Namely, there's a lot more oscillation if the points are not shuffled, which is due to two data-points of opposite signs \"pulling\" the dividing line back and forth until it settles somewhere between them."
      }
    ],
    "links": [
      {
        "title": "resume",
        "url": "http://www.math.columbia.edu/~nava/resume.pdf"
      },
      {
        "title": "programming blog",
        "url": "http://codenamenava.wordpress.com"
      },
      {
        "title": "academic webpage",
        "url": "http://www.math.columbia.edu/~nava"
      },
      {
        "title": "personal blog",
        "url": "http://upsidownia.com"
      }
    ]
  }, {
    "id": 750,
    "first_name": "Jasmine",
    "middle_name": "",
    "last_name": "Yan",
    "email": "jasmineyan@college.harvard.edu",
    "twitter": "",
    "github": "jazyan",
    "batch_id": 11,
    "phone_number": "908-205-7144",
    "has_photo": true,
    "bio": "Current Applied Math/CS undergrad at Harvard. I like things that are simple to grasp, but hard to master. I enjoy games/puzzles, algorithms, and Python, and am interested in cryptography, machine learning, and functional programming. I used to play Go and basketball competitively, but now I play just for fun :)",
    "is_faculty": false,
    "is_hacker_schooler": true,
    "job": "Student at Harvard",
    "skills": [

    ],
    "image": "https://d29xw0ra2h4o4u.cloudfront.net/assets/people/jasmine_yan_150-018b08f113c4a10eebd086bb2d595d48.jpg",
    "batch": {
      "id": 11,
      "name": "Summer 1, 2014",
      "start_date": "2014-06-09",
      "end_date": "2014-08-28"
    },
    "projects": [

    ],
    "links": [

    ]
  }, {
    "id": 734,
    "first_name": "Raymond",
    "middle_name": "",
    "last_name": "Zeng",
    "email": "raymond.dot.zeng@gmail.com",
    "twitter": "_raymondzeng",
    "github": "raymondzeng",
    "batch_id": 11,
    "phone_number": "",
    "has_photo": true,
    "bio": "Undergrad at Brown. Interested in any kind of application development, algorithms, and functional programming.\r\n",
    "is_faculty": false,
    "is_hacker_schooler": true,
    "job": "Student at Brown",
    "skills": [
      "javascript",
      "git",
      "python",
      "css",
      "html",
      "flask",
      "java",
      "haskell"
    ],
    "image": "https://d29xw0ra2h4o4u.cloudfront.net/assets/people/raymond_zeng_150-6dbb9a4e4ca6bfb2f43f4056fa1bc77e.jpg",
    "batch": {
      "id": 11,
      "name": "Summer 1, 2014",
      "start_date": "2014-06-09",
      "end_date": "2014-08-28"
    },
    "projects": [
      {
        "title": "CLI Alarm Clock",
        "url": "https://github.com/raymondzeng/alarm-cli",
        "description": "CLI alarm clock using music from your iTunes. Ability to search and select music from the command line. Wakes up your computer if it's asleep."
      },
      {
        "title": "Haskell BitTorrent Leecher",
        "url": "https://github.com/raymondzeng/haskell-bittorrent",
        "description": "A BitTorrent client written in Haskell (leech-only)"
      },
      {
        "title": "Minmax with AB Pruning",
        "url": "https://github.com/raymondzeng/minmax",
        "description": "A generic implementation of the minmax algorithm with alpha-beta pruning in Python.\r\n\r\nComes with implementation of AIs for checkers, connect four, and tictactoe to test the generic-ness. Each also comes with a fully-playable REPL."
      },
      {
        "title": "Very Busy Traveling Salesman",
        "url": "http://github.com/raymondzeng/scheduler",
        "description": "A solver for the Traveling Salesman Problem with additional constraints (time and dependencies). We were interested to see if the additional constraints required an algorithm that had a good ratio of increased efficiency for increased complexity (in writing the algo). \r\n\r\nIt turns out that ratio is very low. \r\n\r\nWe ported the algos from Python to JS so the whole thing can be a SPA. We use Google Maps API to get realistic travel distance. \r\n\r\nLive: http://raymondzeng.github.io/scheduler\r\n\r\nCollaborated with Hector Hei."
      },
      {
        "title": "Bob Ross Painting Generation",
        "url": "http://github.com/raymondzeng/markov_images",
        "description": "Using a collection of Bob Ross' paintings, attempted to use probabilistic methods to generate new paintings in the same gist that markov chains can take a corpus of text and generate new meaningful text. \r\n\r\nEnded up not being too successful because any good algorithm would be too resource intensive. But I did get a few pretty images along the way."
      }
    ],
    "links": [
      {
        "title": "Portfolio | Resume | Blog",
        "url": "http://raymondzeng.github.io"
      }
    ]
  }];

  res.render('people', {
    people: people
  }, function (err, html) {
    res.send(html);
  });
});

module.exports = router;
