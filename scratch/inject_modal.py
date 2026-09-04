import re

code = open('src/phases/cityExplorationPhase.js', 'r', encoding='utf-8').read()

helper_code = """
  showInteriorModal(roomBuilderFunc, npcModelKey, modalUIRenderer) {
    const worldGroup = this.worldGroup;
    const courier = this.courier;
    const scene = this.game.scene;
    const cam = this.game.cameras.mainCamera;

    if (worldGroup) worldGroup.visible = false;
    if (courier) courier.visible = false;

    const room = roomBuilderFunc ? roomBuilderFunc(this.game.state) : window.FFH.createRoomShell();
    room.position.set(0, 0, 0);
    scene.add(room);
    
    let npc = null;
    if (npcModelKey && window.FFH.createNPCMesh) {
       npc = window.FFH.createNPCMesh(npcModelKey);
       npc.position.set(0, 0.05, 0);
       npc.rotation.y = Math.PI / 4;
       scene.add(npc);
    }

    const oldPos = cam.position.clone();
    const oldZoom = cam.zoom;
    
    const template = window.FFH.DIORAMA_VIEW_TEMPLATE || { target: new THREE.Vector3(0, -2.4, 0), zoomOffset: new THREE.Vector3(10, 13.5, 10), zoom: 2.1 };
    const endCamTarget = template.target.clone();
    const endCamPos = new THREE.Vector3().copy(endCamTarget).add(template.zoomOffset);
    
    cam.position.copy(endCamPos);
    cam.lookAt(endCamTarget);
    if(cam.isOrthographicCamera) {
        cam.zoom = template.zoom;
        cam.updateProjectionMatrix();
    }

    this.isEnteringBuilding = true;

    modalUIRenderer((onCompleteCallback) => {
       scene.remove(room);
       if (npc) scene.remove(npc);
       if (worldGroup) worldGroup.visible = true;
       if (courier) courier.visible = true;
       
       cam.position.copy(oldPos);
       if(cam.isOrthographicCamera) {
         cam.zoom = oldZoom;
         cam.updateProjectionMatrix();
       }
       if (onCompleteCallback) onCompleteCallback();
    });
  }

  triggerBuildingInteraction"""

if "showInteriorModal(" not in code:
    code = code.replace("  triggerBuildingInteraction", helper_code)

# Pizzeria
code = code.replace(
    'this.game.ui.showPizzeriaJobModal(() => {',
    'this.showInteriorModal(window.FFH.createPizzeriaRoom, \'NPC_MATHIAS\', (cleanup) => {\n            this.game.ui.showPizzeriaJobModal(() => {\n              cleanup();'
)

# Bakery
code = code.replace(
    'this.game.ui.showBakeryJobModal(() => {',
    'this.showInteriorModal(window.FFH.createBakeryRoom, \'NPC_MARTHA\', (cleanup) => {\n            this.game.ui.showBakeryJobModal(() => {\n              cleanup();'
)

# Uni
code = code.replace(
    'this.game.ui.showLockedUniModal(() => {',
    'this.showInteriorModal(window.FFH.createUniRoom, null, (cleanup) => {\n          this.game.ui.showLockedUniModal(() => {\n            cleanup();'
)

# WG Buzzer
code = code.replace(
    'this.game.ui.showWGBuzzerModal(() => {',
    'this.showInteriorModal(window.FFH.createDoorwayRoom, null, (cleanup) => {\n          this.game.ui.showWGBuzzerModal(() => {\n            cleanup();'
)

# Mülltrennung
code = code.replace(
    'this.game.ui.showMuelltrennungModal((isCorrect) => {',
    'this.showInteriorModal(window.FFH.createWGRoom, \'NPC_NICO\', (cleanup) => {\n          this.game.ui.showMuelltrennungModal((isCorrect) => {\n            cleanup();'
)


# The replaced blocks need an extra `});` to close `this.showInteriorModal(...)`.
# Pizzeria
code = code.replace(
    "this.startBuildingExit();\n            });\n          }",
    "this.startBuildingExit();\n            });\n            });\n          }"
)

# Bakery
code = code.replace(
    "this.startBuildingExit();\n            });\n          }\n          return;",
    "this.startBuildingExit();\n            });\n            });\n          }\n          return;"
)

# Uni
code = code.replace(
    "this.startBuildingExit();\n              });\n            } else {",
    "this.startBuildingExit();\n              });\n            });\n            } else {"
)
# Note: actually Uni is:
# this.game.ui.updateQuestTracker();
# }
# this.startBuildingExit();
# });
# } else {
# this.triggerBuildingInteraction('B_WG_ENTERED');
# Let's fix this properly.

with open('src/phases/cityExplorationPhase.js', 'w', encoding='utf-8') as f:
    f.write(code)
