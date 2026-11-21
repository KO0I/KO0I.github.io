export const fields = [
  { key: 'width', label: 'Width', group: 'shape', min: 160, max: 480, step: 1, unit: 'px' },
  { key: 'height', label: 'Height', group: 'shape', min: 70, max: 260, step: 1, unit: 'px' },
  { key: 'roundness', label: 'Corner rounding', group: 'shape', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'depth', label: 'Optical depth', group: 'optics', min: 0, max: 200, step: 1, unit: '%' },
  { key: 'lensRefraction', label: 'Lens refraction', group: 'optics', min: .01, max: 1, step: .01 },
  { key: 'dispersion', label: 'Color dispersion', group: 'optics', min: 0, max: .15, step: .001 },
  { key: 'sharp', label: 'Edge softness', group: 'optics', min: .01, max: 1, step: .01 },
  { key: 'f0', label: 'Base reflectance', group: 'light', min: 0, max: 1, step: .01 },
  { key: 'fresnel', label: 'Fresnel brightness', group: 'light', min: 0, max: 2, step: .01 },
  { key: 'specPower', label: 'Specular power', group: 'light', min: 1, max: 128, step: 1 },
  { key: 'edgeHighlight', label: 'Edge highlight', group: 'light', min: 0, max: 5, step: .05 },
  { key: 'rimStrength', label: 'Rim strength', group: 'light', min: 0, max: 1, step: .01 },
];

export const defaults = Object.freeze({
  depth: 100, width: 360, height: 144, roundness: 75,
  lensRefraction: .3, sharp: .5, f0: .04, dispersion: .008,
  specPower: 32, edgeHighlight: 2, rimStrength: .15, fresnel: .3,
});

export const presets = {
  original: defaults,
  subtle: { ...defaults, lensRefraction: .08, dispersion: .002, edgeHighlight: 1, fresnel: .1 },
  prism: { ...defaults, lensRefraction: .45, dispersion: .12, f0: .12, edgeHighlight: 3, fresnel: .6 },
  magnify: { ...defaults, width: 360, height: 144, roundness: 49, lensRefraction: .84, dispersion: .077, sharp: .34, f0: .15, fresnel: .97 },
};

export function fitLens(settings, stageWidth, stageHeight) {
  const scale = Math.min(1, stageWidth / settings.width, stageHeight / settings.height);
  const width = settings.width * scale;
  const height = settings.height * scale;
  return { width, height, radius: Math.min(width, height) * settings.roundness / 200 };
}

export function clampPosition(position, lens, stage) {
  return {
    x: Math.max(0, Math.min(position.x, stage.width - lens.width)),
    y: Math.max(0, Math.min(position.y, stage.height - lens.height)),
  };
}

export function exportSettings(settings) {
  const { width, height, roundness, ...look } = settings;
  return {
    version: 1,
    size: { width, height, roundness },
    shape: { width: 1, height: height / width, radius: Math.min(1, height / width) * roundness / 100 },
    look,
  };
}

export function packUniforms(target, canvas, settings) {
  const { shape, look } = exportSettings(settings);
  target.set([
    canvas.x, canvas.y, canvas.width, canvas.height,
    shape.width, shape.height, shape.radius,
    look.lensRefraction, look.sharp, look.f0, look.dispersion,
    look.specPower, look.edgeHighlight, look.rimStrength, look.fresnel, look.depth / 100,
  ]);
}
