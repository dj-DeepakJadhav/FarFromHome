const fs = require('fs');
const path = require('path');

function assemble() {
  const root = path.join(__dirname, '..');
  
  console.log('Assembling final single index.html release build...');
  
  // Read index.dev.html
  let devHtml = fs.readFileSync(path.join(root, 'index.dev.html'), 'utf-8');
  
  // Get vendor script contents
  const threeJsPath = path.join(root, 'vendor', 'three.min.js');
  if (!fs.existsSync(threeJsPath)) {
    console.error('CRITICAL: vendor/three.min.js not found! Please run the download command first.');
    process.exit(1);
  }
  const threeJsContent = fs.readFileSync(threeJsPath, 'utf-8');

  const gltfLoaderPath = path.join(root, 'vendor', 'GLTFLoader.js');
  if (!fs.existsSync(gltfLoaderPath)) {
    console.error('CRITICAL: vendor/GLTFLoader.js not found!');
    process.exit(1);
  }
  const gltfLoaderContent = fs.readFileSync(gltfLoaderPath, 'utf-8');

  const bvhPath = path.join(root, 'vendor', 'three-mesh-bvh.umd.js');
  if (!fs.existsSync(bvhPath)) {
    console.error('CRITICAL: vendor/three-mesh-bvh.umd.js not found!');
    process.exit(1);
  }
  const bvhContent = fs.readFileSync(bvhPath, 'utf-8');

  // Post-processing chain (ink outline pass). Order matters: Pass defines the
  // base class + FullScreenQuad, EffectComposer depends on all the others.
  const postFiles = ['Pass.js', 'CopyShader.js', 'ShaderPass.js', 'RenderPass.js', 'MaskPass.js', 'EffectComposer.js'];
  const postContents = {};
  for (const pf of postFiles) {
    const p = path.join(root, 'vendor', pf);
    if (!fs.existsSync(p)) {
      console.error(`CRITICAL: vendor/${pf} not found!`);
      process.exit(1);
    }
    postContents[pf] = fs.readFileSync(p, 'utf-8');
  }

  // Script file sequence matching dependency structure
  const vendorFiles = [
    'vendor/three.min.js',
    'vendor/three-mesh-bvh.umd.js',
    'vendor/GLTFLoader.js',
    'vendor/MTLLoader.js',
    'vendor/OBJLoader.js'
  ];
  const srcFiles = [
    'src/core/economy.js',
    'src/core/npcBehaviorTree.js',
    'src/data/prologueQuests.js',
    'src/data/characterModels.js',
    'src/data/npcDialogue.js',
    'src/data/items.js',
    'src/data/shifts.js',
    'src/data/streets.js',
    'src/data/townLayout.js',
    'src/data/objAssets.js',
    'src/data/dialogue.js',
    'src/data/audioTriggers.js',
    'src/data/voiceSprites.js',
    'src/core/grammarEngine.js',
    'src/data/shop.js',
    'src/data/skillTree.js',
    'src/render/celShaderMaterial.js',
    'src/render/inkOutline.js',
    'src/render/dioramaRooms.js',
    'src/render/character.js',
    'src/render/npcFactory.js',
    'src/render/titleMesh.js',
    'src/render/cityMap.js',
    'src/render/geometryFactory.js',
    'src/render/sceneSetup.js',
    'src/render/particles.js',
    'src/audio/sfx.js',
    'src/audio/speech.js',
    'src/ui/hud.js',
    'src/phases/pickPhase.js',
    'src/phases/shopPhase.js',
    'src/phases/cityExplorationPhase.js',
    'src/phases/dialoguePhase.js',
    'src/main.js'
  ];
  
  let mergedSourceCode = '';
  for (const file of srcFiles) {
    console.log(`- Inlining ${file}`);
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) {
      console.error(`CRITICAL: Source file missing: ${file}`);
      process.exit(1);
    }
    mergedSourceCode += `\n/* --- FILE: ${file} --- */\n` + fs.readFileSync(filePath, 'utf-8') + '\n';
  }
  
  // Strip old dev script tags and replace with inlined modules
  let outputHtml = devHtml;
  
  // 1. Replace vendor script tags
  const vendorTagPattern = /<script src="vendor\/three\.min\.js"><\/script>/;
  outputHtml = outputHtml.replace(vendorTagPattern, `<script>\n${threeJsContent}\n</script>`);

  const gltfLoaderTagPattern = /<script src="vendor\/GLTFLoader\.js"><\/script>/;
  outputHtml = outputHtml.replace(gltfLoaderTagPattern, `<script>\n${gltfLoaderContent}\n</script>`);

  const bvhTagPattern = /<script src="vendor\/three-mesh-bvh\.umd\.js"><\/script>/;
  outputHtml = outputHtml.replace(bvhTagPattern, `<script>\n${bvhContent}\n</script>`);

  for (const pf of postFiles) {
    const tagPattern = new RegExp('<script src="vendor/' + pf.replace('.', '\\.') + '"></script>');
    outputHtml = outputHtml.replace(tagPattern, `<script>\n${postContents[pf]}\n</script>`);
  }

  // 2. Remove all dev script tags
  const devScriptsPattern = /<!-- Game Source Code -->[\s\S]*?<\/body>/;
  const inlineBlock = `<script>\n${mergedSourceCode}\n</script>\n</body>`;
  outputHtml = outputHtml.replace(devScriptsPattern, inlineBlock);
  
  // Write index.html to workspace root
  fs.writeFileSync(path.join(root, 'index.html'), outputHtml, 'utf-8');
  console.log('SUCCESS: index.html assembled at repository root.');
}

assemble();
