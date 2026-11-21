// WebGPU setup adapted from arya3d/liquid-glass-webgpu, MIT.
import { GLASS_PASS_SHADER } from './glass-shader.mjs';
import { packUniforms } from './settings.mjs';

export class GlassRenderer {
  static async create(device, canvas) {
    device.pushErrorScope('validation');
    const module = device.createShaderModule({ label: 'Liquid glass shader', code: GLASS_PASS_SHADER });
    const format = navigator.gpu.getPreferredCanvasFormat();
    let pipeline;
    try {
      pipeline = await device.createRenderPipelineAsync({
        label: 'Liquid glass', layout: 'auto',
        vertex: { module, entryPoint: 'vert_main' },
        fragment: { module, entryPoint: 'frag_main', targets: [{ format }, { format: 'rgba8unorm' }] },
        primitive: { topology: 'triangle-list' },
      });
    } finally {
      const error = await device.popErrorScope();
      if (error) throw new Error(error.message);
    }
    return new GlassRenderer(device, canvas, pipeline, format);
  }

  constructor(device, canvas, pipeline, format) {
    this.device = device;
    this.canvas = canvas;
    this.pipeline = pipeline;
    this.context = canvas.getContext('webgpu');
    if (!this.context) throw new Error('WebGPU canvas unavailable.');
    this.context.configure({ device, format, alphaMode: 'opaque' });
    this.data = new Float32Array(16);
    this.uniformBuffer = device.createBuffer({ size: this.data.byteLength, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.sampler = device.createSampler({ addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge', minFilter: 'linear', magFilter: 'linear' });
  }

  showPage(source) {
    const size = [source.width, source.height];
    const texture = this.device.createTexture({
      label: 'Preview capture', size, format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.device.queue.copyExternalImageToTexture({ source }, { texture }, size);
    this.pageTexture?.destroy();
    this.pageTexture = texture;
    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: texture.createView() },
      ],
    });
  }

  render(position, settings) {
    if (!this.bindGroup) return;
    const { width, height } = this.canvas;
    packUniforms(this.data, { ...position, width, height }, settings);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.data);
    if (this.mask?.width !== width || this.mask?.height !== height) {
      this.mask?.destroy();
      this.mask = this.device.createTexture({ size: [width, height], format: 'rgba8unorm', usage: GPUTextureUsage.RENDER_ATTACHMENT });
    }
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({ colorAttachments: [
      { view: this.context.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store' },
      { view: this.mask.createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store' },
    ] });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(6);
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  destroy() {
    this.pageTexture?.destroy();
    this.mask?.destroy();
    this.uniformBuffer.destroy();
    this.context.unconfigure();
    this.device.destroy();
  }
}
