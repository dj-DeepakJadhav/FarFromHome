const fs = require('fs');
const path = require('path');

function assemble() {
  const root = path.join(__dirname, '..');
  
  console.log('Assembling final single index.html release build...');
  
  // Read index.dev.html
  let devHtml = fs.readFileSync(path.join(root, 'index.dev.html'), 'utf-8');
  
  // Every vendor library that index.dev.html loads, in dependency order.
  // This list must match the <script src="vendor/..."> tags that appear BEFORE
  // the "<!-- Game Source Code -->" marker in index.dev.html: everything from
  // that marker to </body> is stripped and replaced with the merged src bundle,
  // so a vendor tag placed after it would be silently dropped from the release.
  // Order matters twice over: Pass.js defines the base class + FullScreenQuad
  // that EffectComposer needs, and MTLLoader must precede OBJLoader.
  const vendorFiles = [
    'three.min.js',
    'three-mesh-bvh.umd.js',
    'GLTFLoader.js',
    'Pass.js',
    'CopyShader.js',
    'ShaderPass.js',
    'RenderPass.js',
    'MaskPass.js',
    'EffectComposer.js',
    'MTLLoader.js',
    'OBJLoader.js'
  ];
  const vendorContents = {};
  for (const vf of vendorFiles) {
    const p = path.join(root, 'vendor', vf);
    if (!fs.existsSync(p)) {
      console.error(`CRITICAL: vendor/${vf} not found!`);
      process.exit(1);
    }
    vendorContents[vf] = fs.readFileSync(p, 'utf-8');
  }

  const srcFiles = [
    'src/core/pathfinding.js',
    'src/core/economy.js',
    'src/core/storyRunner.js',
    'src/core/npcBehaviorTree.js',
    'src/data/prologueQuests.js',
    'src/data/characterModels.js',
    'src/data/characterGLB.js',
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
    'src/render/proceduralTextures.js',
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
  
  // Guard against dev/release drift. index.dev.html and this list must load the
  // same modules in the same order, or the game judges play is not the game we
  // tested in the browser.
  const missingFromDev = srcFiles.filter(f => !devHtml.includes(`<script src="${f}"></script>`));
  if (missingFromDev.length) {
    console.error('CRITICAL: these modules are inlined into the release but have no tag in index.dev.html:');
    missingFromDev.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  }
  const devSrcTags = [...devHtml.matchAll(/<script src="(src\/[^"]+)"><\/script>/g)].map(m => m[1]);
  const missingFromRelease = devSrcTags.filter(f => !srcFiles.includes(f));
  if (missingFromRelease.length) {
    console.error('CRITICAL: index.dev.html loads modules that the release build omits:');
    missingFromRelease.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  }

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
  
  // 1. Replace each vendor script tag with its inlined contents. A tag that
  //    fails to match means the release build would silently ship without that
  //    library, so treat a miss as fatal rather than letting it through.
  for (const vf of vendorFiles) {
    const tagPattern = new RegExp('<script src="vendor/' + vf.replace(/\./g, '\\.') + '"></script>');
    if (!tagPattern.test(outputHtml)) {
      console.error(`CRITICAL: no <script src="vendor/${vf}"> tag found in index.dev.html before the "Game Source Code" marker.`);
      process.exit(1);
    }
    outputHtml = outputHtml.replace(tagPattern, `<script>\n${vendorContents[vf]}\n</script>`);
  }

  // 2. Inline assets/narrative/story.json as window.FFH.storyData for 100% offline compliance
  const storyJsonPath = path.join(root, 'assets', 'narrative', 'story.json');
  let storyJsonData = '{}';
  if (fs.existsSync(storyJsonPath)) {
    storyJsonData = fs.readFileSync(storyJsonPath, 'utf-8');
    console.log(`- Inlining story.json (${Math.round(storyJsonData.length / 1024)} KB)`);
  }
  const storyDataScript = `\nwindow.FFH = window.FFH || {};\nwindow.FFH.storyData = ${storyJsonData};\n`;

  // 3. Remove all dev script tags and replace with inlined release scripts
  const devScriptsPattern = /<!-- Game Source Code -->[\s\S]*?<\/body>/;
  const inlineBlock = `<script>${storyDataScript}\n${mergedSourceCode}\n</script>\n</body>`;
  outputHtml = outputHtml.replace(devScriptsPattern, inlineBlock);
  
  // Write index.html to workspace root
  fs.writeFileSync(path.join(root, 'index.html'), outputHtml, 'utf-8');
  console.log('SUCCESS: index.html assembled at repository root.');
}

assemble();
