window.addEventListener('load', () => {
  ymaps.ready(initMap);
})

function initMap() {
  const mapContainer = document.querySelector('.d-map');
  if (!mapContainer) return;
  const map = mapContainer.querySelector('#js-yandex-map');
  if (!map) return;

  const deviceWidth = document.documentElement.clientWidth;
  let mapCenter = [mapContainer.dataset.initialLongitude, mapContainer.dataset.initialLatitude];
  let mapZoom = mapContainer.dataset.initialZoom;

  if (deviceWidth <= 1024) {
    mapCenter = [mapContainer.dataset.tabletInitialLongitude, mapContainer.dataset.tabletInitialLatitude];
    mapZoom = mapContainer.dataset.tabletInitialZoom;
  }
  if (deviceWidth <= 576) {
    mapCenter = [mapContainer.dataset.mobileInitialLongitude, mapContainer.dataset.mobileInitialLatitude];
    mapZoom = mapContainer.dataset.mobileInitialZoom;
  }

  const tekoMap = new ymaps.Map(map, {
    center: mapCenter,
    zoom: mapZoom,
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
      const mobileListContainer = document.querySelector('#js-mobile-map-list-container');

      data.groups.forEach(group => {
        const count = group.count || group.places.length;
        _renderGroupItem(listContainer, {
          image: group.groupIcon,
          count: count,
          text: group.groupLabel
        });
        _renderGroupItem(mobileListContainer, {
          image: group.groupIcon,
          count: count,
          text: group.groupLabel
        });
        
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
    iconImageSize: [12, 17],
    iconImageOffset: [-6, -17]
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
        partCoords, {}, {
        fillColor: '#fff',
        interactivityModel: 'default#transparent',
        strokeWidth: 0,
        opacity: 0.5
        }
      );
      map.geoObjects.add(polygon);
    })
  })
  .catch(err => {
    console.warn(err);
  })
}