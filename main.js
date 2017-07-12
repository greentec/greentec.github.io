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
  'Sum of All Possibilites, 3D' : {
    imageSrc : 'playground/image/sumOfAllP3D.png',
    link : 'playground/html/sumOfAllP3D.html',
    desc : 'Actionscript'
  },
  'Segregation' : {
    imageSrc : 'playground/image/Segregation.png',
    link : 'playground/html/Segregation.html',
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
