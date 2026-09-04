import re

content = open('src/render/dioramaRooms.js', 'r', encoding='utf-8').read()

pizzeria_room = """
window.FFH.createPizzeriaRoom = function() {
  const room = window.FFH.createRoomShell(0xFFDFBA, 0xB04A3E); // warm peach wall, red tile floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const counter = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0xE76F51));
  counter.scale.set(2.0, 0.8, 0.6);
  counter.position.set(-0.3, 0.4, -0.7);
  room.add(counter);
  return room;
};
"""

bakery_room = """
window.FFH.createBakeryRoom = function() {
  const room = window.FFH.createRoomShell(0xFAE1DF, 0xD4A373); // pinkish wall, wood floor
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const counter = new THREE.Mesh(boxGeo, window.FFH.createCelMaterial(0x8D5B4C));
  counter.scale.set(2.0, 0.8, 0.6);
  counter.position.set(-0.3, 0.4, -0.7);
  room.add(counter);
  return room;
};
"""

if "createPizzeriaRoom" not in content:
    content += pizzeria_room + bakery_room
    with open('src/render/dioramaRooms.js', 'w', encoding='utf-8') as f:
        f.write(content)
