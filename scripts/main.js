window.addEventListener('load', () => {
  console.log("Hello, JS!");

  ymaps.ready(initMap);
})

function initMap() {
  const mapContainer = document.querySelector('.d-map');
  const map = mapContainer.querySelector('#js-yandex-map');
  if (!map) return;

  const tekoMap = new ymaps.Map(map, {
    center: [mapContainer.dataset.initialLongitude, mapContainer.dataset.initialLatitude],
    zoom: mapContainer.dataset.initialZoom,
    controls: []
  }, {
    yandexMapDisablePoiInteractivity: true,
    suppressMapOpenBlock: true
  });

  tekoMap.behaviors.disable('scrollZoom');

  _getData(mapContainer, tekoMap);

  _renderRussiaPolygon(tekoMap);
}

function _getData(mapContainer, map) {
  const url = mapContainer.dataset.url;

  fetch(url)
    .then(res => {
      return res.json()
    })
    .then(data => {
      const listContainer = document.querySelector('#js-map-list-container');

      data.groups.forEach(group => {
        _renderGroupItem(listContainer, {
          image: group.groupIcon,
          count: group.places.length,
          text: group.groupLabel
        })
        
        group.places.forEach(place => {
          _addPlace(map, {
            coords: place.coords,
            image: group.groupIcon
          });
        })
      })
    })
    .catch(err => {
      console.warn(err);
    })
}

function _addPlace(map, {coords, image}) {
  const placemarkProperties = {};

  const placemarkOptions = {
    iconLayout: 'default#image',
    iconImageHref: image,
    iconImageSize: [40, 40],
    iconImageOffset: [-20, -40]
  };

  const placemark = new ymaps.Placemark(coords, placemarkProperties, placemarkOptions);

  map.geoObjects.add(placemark);
}

function _renderGroupItem(container, {image, count, text}) {
  const itemHTML =`
    <li class="d-map__place place">
      <div class="place__image-wrapper">
        <img src="${image}" alt="${text}">
      </div>
      <div class="place__description">
        <h3>${count}</h3>
        <p>${text}</p>
      </div>
    </li>`;

  container.innerHTML += itemHTML;
}

function _renderRussiaPolygon(map) {
  fetch('https://nominatim.openstreetmap.org/details.php?osmtype=R&osmid=60189&class=boundary&addressdetails=1&hierarchy=0&group_hierarchy=1&format=json&polygon_geojson=1')
  .then(res => res.json())
  .then(data => {
    console.log(data.geometry.coordinates);

    // ---

    res = data.geometry.coordinates.map(group => {
      return group.map(innerGroup => {
        return innerGroup.map(coords => {
          const newCoords = [coords[1], coords[0]];
          return newCoords
        })
      })
    });

    // ---

    res.forEach(partCoords => {
      const polygon = new ymaps.Polygon(
        partCoords, {
        hintContent: "Многоугольник"
        }, {
        fillColor: '#6699ff',
        // Делаем полигон прозрачным для событий карты.
        interactivityModel: 'default#transparent',
        strokeWidth: 8,
        opacity: 0.1
        }
      );
      map.geoObjects.add(polygon);
    })
  })
  .catch(err => {
    console.warn(err);
  })
}