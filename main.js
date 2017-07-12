var homepage = {};

homepage.cardList = {
  'WaterColor' : {
    imageSrc : 'playground/image/watercolor.png',
    link : 'https://codepen.io/greentec/pen/Ogrjwx',
    desc : 'Javascript, CodePen link'
  },
  'Venation 2D' : {
    imageSrc : 'playground/image/venation.png',
    link : 'https://codepen.io/greentec/pen/qjQebe',
    desc : 'Javascript, CodePen link'
  },
  '3D Cube DFS Maze' : {
    imageSrc : 'playground/image/3DMazeWithDFS.png',
    link : 'playground/html/3DMazeWithDFS.html',
    desc : 'Actionscript'
  },
  'Sum of All Possibilites, 3D' : {
    imageSrc : 'playground/image/sumOfAllP3D.png',
    link : 'playground/html/sumOfAllP3D.html',
    desc : 'Actionscript'
  },
  'Segregation' : {
    imageSrc : 'playground/image/Segregation.png',
    link : 'playground/html/Segregation.html',
    desc : 'Actionscript'
  },
  'Zone of Cooperation' : {
    imageSrc : 'playground/image/ZoneOfCooperation.png',
    link : 'playground/html/ZoneOfCooperation.html',
    desc : 'Actionscript'
  },
  'Cellular Automata' : {
    imageSrc : 'playground/image/CellularAutomata.png',
    link : 'playground/html/CellularAutomata.html',
    desc : 'Actionscript'
  },
  'Pixel Sprite Generator' : {
    imageSrc : 'playground/image/PixelSpriteGenerator.png',
    link : 'playground/html/PixelSpriteGenerator.html',
    desc : 'Actionscript'
  },
  'Dungeon demo' : {
    imageSrc : 'playground/image/DungeonDemo.png',
    link : 'playground/html/DungeonDemo.html',
    desc : 'Actionscript'
  },
  'Self Organizing Map' : {
    imageSrc : 'playground/image/SOM.png',
    link : 'playground/html/SOM.html',
    desc : 'Actionscript'
  },
  'Self Organizing Map, 3D' : {
    imageSrc : 'playground/image/SOM3D.png',
    link : 'playground/html/SOM3D.html',
    desc : 'Actionscript'
  },
  '[Game] Hexagonal Cipher' : {
    imageSrc : 'playground/image/HexagonalCipher.png',
    link : 'playground/html/HexagonalCipher.html',
    desc : 'Actionscript'
  },
  '[Game] Hex Mine Sweeper' : {
    imageSrc : 'playground/image/HexMineSweeper.png',
    link : 'playground/html/HexMineSweeper.html',
    desc : 'Actionscript'
  },
  '[Game] 2048' : {
    imageSrc : 'playground/image/2048.png',
    link : 'playground/html/2048.html',
    desc : 'Actionscript'
  }

}

$(document).ready(function() {
  var cards = $('#playgroundCards');

  for (var cardName in homepage.cardList) {
    var cardObj = homepage.cardList[cardName];
    cards.append('<div class="ui card"><a class="image" href="' + cardObj['link'] + '"><img src="' + cardObj['imageSrc'] + '"></a><div class="content"><div class="header">' + cardName + '</div><div class="meta">' + cardObj['desc'] + '</div></div></div>')
  }
});
