'use client';
import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    class VisualSynthesizer {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      width: number;
      height: number;
      mode: number;
      frame: number;
      elements: any[];
      constructor() {
        this.canvas = document.getElementById('canvas-bg') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.resize();
        this.mode = 0;
        this.frame = 0;
        this.elements = [];
        window.addEventListener('resize', () => this.resize());
        this.initMode(0);
        this.animate();
      }
      resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.initMode(this.mode);
      }
      setMode(index: number) {
        this.mode = index % 20;
        this.initMode(this.mode);
      }
      initMode(mode: number) {
        this.elements = [];
        this.frame = 0;
        const count = this.width > 800 ? 60 : 30;
        switch (mode) {
          case 0:
            for (let i = 0; i < count; i++)
              this.elements.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: Math.random() - 0.5,
                vy: Math.random() - 0.5,
              });
            break;
          case 1:
            const cols = Math.floor(this.width / 20);
            for (let i = 0; i < cols; i++)
              this.elements.push({
                x: i * 20,
                y: Math.random() * -this.height,
                speed: Math.random() * 5 + 2,
              });
            break;
          case 2:
            for (let i = 0; i < 20; i++)
              this.elements.push({
                r: Math.random() * 150 + 50,
                angle: Math.random() * Math.PI * 2,
                speed: (Math.random() - 0.5) * 0.02,
              });
            break;
          case 3:
            for (let i = 0; i < 200; i++)
              this.elements.push({
                x: Math.random() * this.width - this.width / 2,
                y: Math.random() * this.height - this.height / 2,
                z: Math.random() * this.width,
              });
            break;
          case 5:
            for (let i = 0; i < 20; i++)
              this.elements.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 60 + 20,
                rot: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 0.05,
              });
            break;
          case 8:
            for (let i = 0; i < 100; i++)
              this.elements.push({
                angle: Math.random() * Math.PI * 2,
                radius: Math.random() * this.width,
                speed: Math.random() * 0.02 + 0.005,
              });
            break;
          case 9:
            for (let i = 0; i < 50; i++)
              this.elements.push({ y: (i / 50) * this.height, offset: i * 0.2 });
            break;
          case 11:
            for (let i = 0; i < 20; i++)
              this.elements.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                dir: Math.floor(Math.random() * 4),
                len: 0,
              });
            break;
          case 12:
            for (let i = 0; i < 10; i++)
              this.elements.push({
                r: (i + 1) * 30,
                speed: (Math.random() + 0.2) * (i % 2 == 0 ? 1 : -1) * 0.01,
                angle: Math.random() * Math.PI * 2,
              });
            break;
          case 13:
            for (let i = 0; i < 30; i++) this.elements.push({ h: Math.random() * 100 });
            break;
          case 15:
            for (let i = 0; i < 60; i++)
              this.elements.push({
                cx: Math.random() * this.width,
                cy: Math.random() * this.height,
                angle: Math.random() * Math.PI * 2,
                r: 0,
                life: Math.random(),
              });
            break;
          case 16:
            for (let i = 0; i < 20; i++) this.elements.push({ z: i * 50 });
            break;
          case 19:
            for (let i = 0; i < 12; i++)
              this.elements.push({
                x: (Math.random() * this.width) / 2,
                y: (Math.random() * this.height) / 2,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
              });
            break;
        }
      }
      animate() {
        this.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
        if ([1, 4, 6, 11, 15].includes(this.mode)) this.ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.frame++;
        switch (this.mode) {
          case 0:
            this.drawConstellation();
            break;
          case 1:
            this.drawMatrix();
            break;
          case 2:
            this.drawNeuralOrbs();
            break;
          case 3:
            this.drawStarfield();
            break;
          case 4:
            this.drawWaves();
            break;
          case 5:
            this.drawCubes();
            break;
          case 6:
            this.drawGrid();
            break;
          case 7:
            this.drawStatic();
            break;
          case 8:
            this.drawVortex();
            break;
          case 9:
            this.drawHelix();
            break;
          case 10:
            this.drawHexagons();
            break;
          case 11:
            this.drawCircuits();
            break;
          case 12:
            this.drawRings();
            break;
          case 13:
            this.drawAudio();
            break;
          case 14:
            this.drawEcology();
            break;
          case 15:
            this.drawFireworks();
            break;
          case 16:
            this.drawTunnel();
            break;
          case 17:
            this.drawLissajous();
            break;
          case 18:
            this.drawTerrain();
            break;
          case 19:
            this.drawKaleidoscope();
            break;
        }
        requestAnimationFrame(() => this.animate());
      }
      drawConstellation() {
        this.ctx.fillStyle = '#00f2ff';
        this.ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
        this.elements.forEach((p: any, i: number) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > this.width) p.vx *= -1;
          if (p.y < 0 || p.y > this.height) p.vy *= -1;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 2, 0, 7);
          this.ctx.fill();
          for (let j = i + 1; j < this.elements.length; j++) {
            let p2 = this.elements[j];
            if (Math.hypot(p.x - p2.x, p.y - p2.y) < 150) {
              this.ctx.beginPath();
              this.ctx.moveTo(p.x, p.y);
              this.ctx.lineTo(p2.x, p2.y);
              this.ctx.stroke();
            }
          }
        });
      }
      drawMatrix() {
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = '15px monospace';
        this.elements.forEach((c: any) => {
          c.y += c.speed;
          if (c.y > this.height) c.y = -20;
          this.ctx.fillText(String.fromCharCode(0x30a0 + Math.random() * 96), c.x, c.y);
        });
      }
      drawNeuralOrbs() {
        this.ctx.strokeStyle = `hsla(${this.frame},70%,50%,0.3)`;
        this.elements.forEach((o: any) => {
          o.angle += o.speed;
          this.ctx.beginPath();
          this.ctx.arc(
            this.width / 2 + Math.cos(o.angle) * o.r,
            this.height / 2 + Math.sin(o.angle * 0.5) * (o.r * 0.5),
            10,
            0,
            7,
          );
          this.ctx.stroke();
        });
      }
      drawStarfield() {
        this.ctx.fillStyle = '#fff';
        this.elements.forEach((s: any) => {
          s.z -= 10;
          if (s.z <= 0) {
            s.z = this.width;
            s.x = Math.random() * this.width - this.width / 2;
            s.y = Math.random() * this.height - this.height / 2;
          }
          let k = 128 / s.z,
            px = this.width / 2 + s.x * k,
            py = this.height / 2 + s.y * k;
          if (px > 0 && px < this.width && py > 0 && py < this.height)
            this.ctx.fillRect(px, py, (1 - s.z / this.width) * 4, (1 - s.z / this.width) * 4);
        });
      }
      drawWaves() {
        this.ctx.strokeStyle = '#00f2ff';
        this.ctx.beginPath();
        for (let x = 0; x < this.width; x += 10)
          this.ctx.lineTo(x, this.height / 2 + Math.sin(x * 0.01 + this.frame * 0.05) * 100);
        this.ctx.stroke();
      }
      drawCubes() {
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.elements.forEach((c: any) => {
          c.rot += c.vRot;
          c.y -= 0.5;
          if (c.y < -100) c.y = this.height + 100;
          this.ctx.save();
          this.ctx.translate(c.x, c.y);
          this.ctx.rotate(c.rot);
          this.ctx.strokeRect(-c.size / 2, -c.size / 2, c.size, c.size);
          this.ctx.restore();
        });
      }
      drawGrid() {
        this.ctx.strokeStyle = '#303030';
        for (let i = 0; i < this.width; i += 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(i, this.height / 2);
          this.ctx.lineTo((i - this.width / 2) * 4 + this.width / 2, this.height);
          this.ctx.stroke();
        }
        for (let i = 0; i < this.height / 2; i += 40) {
          let y = this.height / 2 + i + ((this.frame * 2) % 100);
          if (y > this.height) y -= this.height / 2;
          this.ctx.beginPath();
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(this.width, y);
          this.ctx.stroke();
        }
      }
      drawStatic() {
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++)
          this.ctx.fillRect(
            Math.random() * this.width,
            Math.random() * this.height,
            Math.random() * 100,
            2,
          );
      }
      drawVortex() {
        this.ctx.fillStyle = '#ff0055';
        this.elements.forEach((p: any) => {
          p.angle += p.speed;
          p.radius -= 0.5;
          if (p.radius < 0) p.radius = this.width / 2;
          this.ctx.fillRect(
            this.width / 2 + Math.cos(p.angle) * p.radius,
            this.height / 2 + Math.sin(p.angle) * p.radius,
            3,
            3,
          );
        });
      }
      drawHelix() {
        this.elements.forEach((p: any) => {
          let off = Math.sin(p.offset + this.frame * 0.05) * 100;
          this.ctx.fillStyle = '#00f2ff';
          this.ctx.beginPath();
          this.ctx.arc(this.width / 2 + off, p.y, 4, 0, 7);
          this.ctx.fill();
          this.ctx.fillStyle = '#ff0055';
          this.ctx.beginPath();
          this.ctx.arc(this.width / 2 - off, p.y, 4, 0, 7);
          this.ctx.fill();
        });
      }
      drawHexagons() {
        this.ctx.strokeStyle = '#00f2ff';
        const size = 50;
        const h = size * Math.sqrt(3);
        for (let y = 0; y < this.height + h; y += h) {
          for (let x = 0; x < this.width + size * 3; x += size * 3) {
            const offset = Math.floor(y / h) % 2 === 0 ? 0 : size * 1.5;
            const pulse = Math.sin((x + y) * 0.01 + this.frame * 0.05);
            if (pulse > 0.5) {
              this.ctx.beginPath();
              for (let i = 0; i < 6; i++)
                this.ctx.lineTo(
                  x + offset + size * Math.cos((i * Math.PI) / 3),
                  y + size * Math.sin((i * Math.PI) / 3),
                );
              this.ctx.stroke();
            }
          }
        }
      }
      drawCircuits() {
        this.ctx.strokeStyle = '#0f0';
        this.ctx.lineWidth = 2;
        this.elements.forEach((p: any) => {
          p.len++;
          if (p.len > 20) {
            p.x += [0, 5, 0, -5][p.dir];
            p.y += [-5, 0, 5, 0][p.dir];
            if (Math.random() > 0.8) p.dir = Math.floor(Math.random() * 4);
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;
            p.len = 0;
          }
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p.x + [0, 5, 0, -5][p.dir], p.y + [-5, 0, 5, 0][p.dir]);
          this.ctx.stroke();
        });
      }
      drawRings() {
        this.ctx.strokeStyle = '#fff';
        const cx = this.width / 2,
          cy = this.height / 2;
        this.elements.forEach((r: any) => {
          r.angle += r.speed;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, r.r, r.angle, r.angle + Math.PI);
          this.ctx.stroke();
        });
      }
      drawAudio() {
        this.ctx.fillStyle = '#ff0055';
        const w = this.width / 30;
        this.elements.forEach((b: any, i: number) => {
          b.h += (Math.random() - 0.5) * 20;
          if (b.h < 10) b.h = 10;
          if (b.h > 300) b.h = 300;
          this.ctx.fillRect(i * w, this.height / 2 - b.h / 2, w - 2, b.h);
        });
      }
      drawEcology() {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const count = 400;
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.frame * 0.002);
        for (let i = 1; i < count; i++) {
          const breathe = 1 + 0.05 * Math.sin(this.frame * 0.02 - i * 0.01);
          const r = 6 * Math.sqrt(i) * breathe;
          const theta = i * goldenAngle;
          const x = r * Math.cos(theta);
          const y = r * Math.sin(theta);
          const hue = 140 + ((i * 0.15) % 40);
          const alpha = Math.max(0, 1 - i / count);
          this.ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
          this.ctx.beginPath();
          this.ctx.arc(x, y, 2 + (i / count) * 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }
      drawFireworks() {
        this.elements.forEach((p: any) => {
          if (p.life > 0) {
            p.r += 2;
            p.life -= 0.02;
            this.ctx.fillStyle = `rgba(255, 200, 50, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.arc(p.cx + Math.cos(p.angle) * p.r, p.cy + Math.sin(p.angle) * p.r, 2, 0, 7);
            this.ctx.fill();
          } else if (Math.random() > 0.98) {
            p.life = 1;
            p.r = 0;
            p.cx = Math.random() * this.width;
            p.cy = Math.random() * this.height;
          }
        });
      }
      drawTunnel() {
        this.ctx.strokeStyle = '#00f2ff';
        const cx = this.width / 2,
          cy = this.height / 2;
        this.elements.forEach((r: any) => {
          r.z -= 1;
          if (r.z <= 0) r.z = 1000;
          const size = 20000 / r.z;
          this.ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
        });
      }
      drawLissajous() {
        this.ctx.strokeStyle = '#fff';
        this.ctx.beginPath();
        for (let i = 0; i < 300; i++) {
          const t = i + this.frame * 0.1;
          const x = this.width / 2 + Math.sin(t * 0.03) * 300;
          const y = this.height / 2 + Math.cos(t * 0.04) * 200;
          this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
      }
      drawTerrain() {
        this.ctx.strokeStyle = '#00f2ff';
        this.ctx.beginPath();
        for (let i = 0; i < this.width; i += 20) {
          const y =
            this.height / 2 + Math.sin(i * 0.01 + this.frame * 0.02) * 50 + Math.sin(i * 0.05) * 20;
          this.ctx.moveTo(i, this.height);
          this.ctx.lineTo(i, y);
        }
        this.ctx.stroke();
      }
      drawKaleidoscope() {
        const cx = this.width / 2,
          cy = this.height / 2;
        this.elements.forEach((p: any) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x > cx || p.x < -cx) p.vx *= -1;
          if (p.y > cy || p.y < -cy) p.vy *= -1;
          this.ctx.fillStyle = p.color;
          for (let i = 0; i < 8; i++) {
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.rotate((i * Math.PI) / 4);
            this.ctx.fillRect(p.x, p.y, 4, 4);
            this.ctx.restore();
          }
        });
      }
    }

    class SlideOrchestrator {
      slides: NodeListOf<Element>;
      count: number;
      currentIdx: number;
      nextIdx: number;
      progressBar: HTMLElement;
      art: VisualSynthesizer;
      speed: number;
      autoplay: boolean;
      isStaying: boolean;
      select: HTMLSelectElement;
      btnPrev: HTMLElement;
      btnNext: HTMLElement;
      btnSettings: HTMLElement;
      settingsPanel: HTMLElement;
      toggleAutoplay: HTMLInputElement;
      speedBtns: NodeListOf<Element>;
      timing: { in: number; stay: number; out: number; stagger: number };
      interruptResolve: (() => void) | null;
      stayTimer: any;
      constructor(artEngine: VisualSynthesizer) {
        this.slides = document.querySelectorAll('.slide');
        this.count = this.slides.length;
        this.currentIdx = 0;
        this.nextIdx = 0;
        this.progressBar = document.getElementById('progress') as HTMLElement;
        this.art = artEngine;
        this.speed = 1.0;
        this.autoplay = true;
        this.isStaying = false;
        this.select = document.getElementById('slide-select') as HTMLSelectElement;
        this.btnPrev = document.getElementById('btn-prev') as HTMLElement;
        this.btnNext = document.getElementById('btn-next') as HTMLElement;
        this.btnSettings = document.getElementById('btn-settings') as HTMLElement;
        this.settingsPanel = document.getElementById('settings-panel') as HTMLElement;
        this.toggleAutoplay = document.getElementById('toggle-autoplay') as HTMLInputElement;
        this.speedBtns = document.querySelectorAll('.speed-btn');
        this.timing = { in: 1000, stay: 2000, out: 1000, stagger: 80 };
        this.interruptResolve = null;
        this.stayTimer = null;
        this.initControls();
      }
      initControls() {
        this.slides.forEach((s, i) => {
          const opt = document.createElement('option');
          opt.value = String(i);
          opt.text = `${i + 1}. ${(s as HTMLElement).dataset.title}`;
          this.select.appendChild(opt);
        });
        this.select.addEventListener('change', (e) =>
          this.jumpTo(parseInt((e.target as HTMLSelectElement).value)),
        );
        this.btnNext.addEventListener('click', () => this.next());
        this.btnPrev.addEventListener('click', () => this.prev());
        this.btnSettings.addEventListener('click', (e) => {
          e.stopPropagation();
          this.settingsPanel.classList.toggle('open');
          this.btnSettings.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
          const target = e.target as Node;
          if (!this.settingsPanel.contains(target) && !this.btnSettings.contains(target)) {
            this.settingsPanel.classList.remove('open');
            this.btnSettings.classList.remove('active');
          }
        });
        this.toggleAutoplay.addEventListener('change', (e) => {
          this.autoplay = (e.target as HTMLInputElement).checked;
          this.handleAutoplayChange();
        });
        this.speedBtns.forEach((btn) => {
          btn.addEventListener('click', () => {
            this.speedBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            this.updateSpeed(parseFloat((btn as HTMLElement).dataset.speed || '1'));
          });
        });
      }
      updateSpeed(val: number) {
        this.speed = val;
        const duration = 1 / this.speed;
        document.documentElement.style.setProperty('--anim-duration', `${duration}s`);
      }
      handleAutoplayChange() {
        if (this.isStaying) {
          if (this.autoplay) {
            const ms = this.timing.stay / this.speed;
            if (this.stayTimer) clearTimeout(this.stayTimer);
            this.stayTimer = setTimeout(() => {
              if (this.interruptResolve) this.interruptResolve();
            }, ms);
          } else {
            if (this.stayTimer) clearTimeout(this.stayTimer);
          }
        }
      }
      jumpTo(index: number) {
        this.nextIdx = index;
        this.interrupt();
      }
      next() {
        this.nextIdx = (this.currentIdx + 1) % this.count;
        this.interrupt();
      }
      prev() {
        this.nextIdx = (this.currentIdx - 1 + this.count) % this.count;
        this.interrupt();
      }
      interrupt() {
        if (this.interruptResolve) {
          this.interruptResolve();
        }
      }
      wait(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms / this.speed));
      }
      waitInterruptible(ms: number) {
        this.isStaying = true;
        return new Promise((resolve) => {
          const finish = () => {
            this.isStaying = false;
            if (this.stayTimer) clearTimeout(this.stayTimer);
            this.interruptResolve = null;
            this.stayTimer = null;
            resolve(null);
          };
          this.interruptResolve = finish;
          if (this.autoplay) {
            this.stayTimer = setTimeout(finish, ms / this.speed);
          }
        });
      }
      async start() {
        this.nextIdx = 0;
        while (true) {
          this.currentIdx = this.nextIdx;
          this.select.value = String(this.currentIdx);
          this.art.setMode(this.currentIdx);
          await this.playSlide(this.currentIdx);
          if (this.nextIdx === this.currentIdx) {
            this.nextIdx = (this.currentIdx + 1) % this.count;
          }
          await this.wait(50);
        }
      }
      async playSlide(index: number) {
        const slide = this.slides[index] as HTMLElement;
        this.slides.forEach((s, i) => {
          if (i === index) (s as HTMLElement).classList.add('active');
          else (s as HTMLElement).classList.remove('active');
        });
        const elements = Array.from(slide.querySelectorAll('.anim-el'));
        elements.forEach((el) => {
          el.classList.remove('animate-in', 'animate-out');
          void (el as HTMLElement).offsetWidth;
        });
        this.progressBar.style.transition = 'none';
        this.progressBar.style.width = '0%';
        const entrancePromises = elements.map((el, i) => {
          return new Promise(async (resolve) => {
            await this.wait(i * this.timing.stagger);
            el.classList.add('animate-in');
            await this.wait(this.timing.in);
            resolve(null);
          });
        });
        const totalDurationRaw =
          elements.length * this.timing.stagger +
          this.timing.in +
          this.timing.stay +
          this.timing.out;
        const totalDuration = totalDurationRaw / this.speed;
        setTimeout(() => {
          this.progressBar.style.transition = `width ${totalDuration}ms linear`;
          this.progressBar.style.width = '100%';
        }, 50);
        await Promise.all(entrancePromises);
        await this.waitInterruptible(this.timing.stay);
        const exitPromises = elements.map((el, i) => {
          return new Promise(async (resolve) => {
            await this.wait(i * this.timing.stagger);
            el.classList.add('animate-out');
            await this.wait(this.timing.out);
            resolve(null);
          });
        });
        await Promise.all(exitPromises);
      }
    }

    const art = new VisualSynthesizer();
    const show = new SlideOrchestrator(art);
    show.start();
  }, []);

  return (
    <>
      <canvas id="canvas-bg"></canvas>
      <div className="slide-container">
        <div className="slide active" data-title="Intro">
          <div className="tagline anim-el">Est. 2024</div>
          <h1 className="anim-el">
            Visual <br />
            Synthesis
          </h1>
          <p className="anim-el">Bridging abstract algorithms and human-centric design.</p>
        </div>
        <div className="slide" data-title="Generative">
          <div className="tagline anim-el">Core</div>
          <h2 className="anim-el">Generative Design</h2>
          <p className="anim-el">Infinite variations of visual identity powered by code.</p>
        </div>
        <div className="slide" data-title="Neural">
          <div className="tagline anim-el">AI</div>
          <h2 className="anim-el">Neural Rendering</h2>
          <p className="anim-el">Workflows that dream beyond human limits.</p>
        </div>
        <div className="slide" data-title="Global">
          <div className="tagline anim-el">Scale</div>
          <h2 className="anim-el">Global Reach</h2>
          <p className="anim-el">Serving clients across 12 time zones seamlessly.</p>
        </div>
        <div className="slide" data-title="Philosophy">
          <div className="tagline anim-el">Zen</div>
          <h2 className="anim-el">Silence & Motion</h2>
          <p className="anim-el">In a world of noise, we design purposeful silence.</p>
        </div>
        <div className="slide" data-title="Analytics">
          <div className="tagline anim-el">Data</div>
          <h2 className="anim-el">Visual Analytics</h2>
          <p className="anim-el">Turning complex datasets into beautiful, actionable art.</p>
        </div>
        <div className="slide" data-title="VR">
          <div className="tagline anim-el">Immersive</div>
          <h2 className="anim-el">Virtual Reality</h2>
          <p className="anim-el">Step inside the brand. Full 3D environments.</p>
        </div>
        <div className="slide" data-title="Team">
          <div className="tagline anim-el">People</div>
          <h2 className="anim-el">Collective Mind</h2>
          <p className="anim-el">Engineers, artists, and architects working as one.</p>
        </div>
        <div className="slide" data-title="Awards">
          <div className="tagline anim-el">Wins</div>
          <h2 className="anim-el">Industry Leaders</h2>
          <p className="anim-el">Awarded &#39;Agency of the Year&#39; by Digital Futures.</p>
        </div>
        <div className="slide" data-title="Contact">
          <div className="tagline anim-el">Connect</div>
          <h2 className="anim-el">Join Us</h2>
          <p className="anim-el">Redefine your digital landscape today.</p>
        </div>
        <div className="slide" data-title="Architecture">
          <div className="tagline anim-el">Structure</div>
          <h2 className="anim-el">Digital Architecture</h2>
          <p className="anim-el">Building the foundations of the metaverse.</p>
        </div>
        <div className="slide" data-title="Security">
          <div className="tagline anim-el">Safety</div>
          <h2 className="anim-el">Cyber Defense</h2>
          <p className="anim-el">Visualizing threats before they happen.</p>
        </div>
        <div className="slide" data-title="Cloud">
          <div className="tagline anim-el">Infrastructure</div>
          <h2 className="anim-el">Cloud Systems</h2>
          <p className="anim-el">Decentralized computing visualized in real-time.</p>
        </div>
        <div className="slide" data-title="Mobile">
          <div className="tagline anim-el">Portable</div>
          <h2 className="anim-el">Mobile First</h2>
          <p className="anim-el">Experiences that scale to the palm of your hand.</p>
        </div>
        <div className="slide" data-title="Ecology">
          <div className="tagline anim-el">Green</div>
          <h2 className="anim-el">Eco Tech</h2>
          <p className="anim-el">Sustainable algorithms for a cleaner future.</p>
        </div>
        <div className="slide" data-title="Social">
          <div className="tagline anim-el">Connect</div>
          <h2 className="anim-el">Social Graphs</h2>
          <p className="anim-el">Mapping the connections that bind us together.</p>
        </div>
        <div className="slide" data-title="Blockchain">
          <div className="tagline anim-el">Web3</div>
          <h2 className="anim-el">Decentralized</h2>
          <p className="anim-el">Transparent ledgers, beautifully rendered.</p>
        </div>
        <div className="slide" data-title="Quantum">
          <div className="tagline anim-el">Future</div>
          <h2 className="anim-el">Quantum Computing</h2>
          <p className="anim-el">Calculations beyond the binary.</p>
        </div>
        <div className="slide" data-title="Gaming">
          <div className="tagline anim-el">Play</div>
          <h2 className="anim-el">Interactive Ent.</h2>
          <p className="anim-el">Next-gen gaming interfaces and HUDs.</p>
        </div>
        <div className="slide" data-title="Education">
          <div className="tagline anim-el">Learn</div>
          <h2 className="anim-el">EdTech</h2>
          <p className="anim-el">Empowering the next generation of creators.</p>
          <a href="#" className="btn anim-el">
            Get Started
          </a>
        </div>
      </div>
      <div className="progress-container">
        <div className="progress-bar" id="progress"></div>
      </div>
      <div className="controls-wrapper">
        <div className="settings-panel" id="settings-panel">
          <div className="setting-row">
            <span className="setting-label">Autoplay</span>
            <label className="toggle-switch">
              <input type="checkbox" id="toggle-autoplay" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-row">
            <span className="setting-label">Speed</span>
            <div className="speed-opts">
              <button className="speed-btn" data-speed="0.5">
                0.5x
              </button>
              <button className="speed-btn active" data-speed="1">
                1x
              </button>
              <button className="speed-btn" data-speed="2">
                2x
              </button>
            </div>
          </div>
        </div>
        <div className="controls">
          <button className="ctrl-btn" id="btn-prev" aria-label="Previous Slide">
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <select className="ctrl-select" id="slide-select"></select>
          <button className="ctrl-btn" id="btn-next" aria-label="Next Slide">
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <div
            style={{
              width: 1,
              height: 16,
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '0 4px',
            }}
          ></div>
          <button className="ctrl-btn" id="btn-settings" aria-label="Settings">
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>
      <style jsx global>{`
        :root {
          --bg-color: #050505;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --accent: #00f2ff;
          --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
          --anim-duration: 1s;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          background-color: var(--bg-color);
          color: var(--text-primary);
          font-family:
            'Inter',
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            Helvetica,
            Arial,
            sans-serif;
          overflow: hidden;
          height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #canvas-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          opacity: 0.5;
        }
        .slide-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1200px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 4rem;
          pointer-events: none;
        }
        .slide {
          display: none;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          pointer-events: auto;
        }
        .slide.active {
          display: flex;
        }
        h1 {
          font-size: 5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, #fff, #888);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        h2 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        p {
          font-size: 1.25rem;
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 700px;
          margin-bottom: 2rem;
        }
        .tagline {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.875rem;
          color: var(--accent);
          margin-bottom: 1rem;
          font-weight: 600;
        }
        .btn {
          display: inline-block;
          padding: 1rem 2.5rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 1rem;
          letter-spacing: 0.05em;
          border-radius: 50px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          pointer-events: auto;
        }
        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .btn:hover::before {
          transform: scaleX(1);
        }
        .anim-el {
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          will-change: opacity, transform;
        }
        .anim-el.animate-in {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition:
            opacity var(--anim-duration) var(--ease-in-out),
            transform var(--anim-duration) var(--ease-in-out);
        }
        .anim-el.animate-out {
          opacity: 0;
          transform: translateY(-40px) scale(0.98);
          transition:
            opacity var(--anim-duration) var(--ease-in-out),
            transform var(--anim-duration) var(--ease-in-out);
        }
        .progress-container {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
          z-index: 20;
        }
        .progress-bar {
          height: 100%;
          background: var(--accent);
          width: 0%;
        }
        .controls-wrapper {
          position: fixed;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          pointer-events: none;
        }
        .controls {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(20, 20, 20, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 8px 16px;
          border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          pointer-events: auto;
        }
        .ctrl-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .ctrl-btn:hover,
        .ctrl-btn.active {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.1);
        }
        .ctrl-btn svg {
          width: 20px;
          height: 20px;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }
        .ctrl-select {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.875rem;
          padding: 6px 12px;
          border-radius: 20px;
          outline: none;
          cursor: pointer;
          text-align: center;
          appearance: none;
          -webkit-appearance: none;
          transition: background 0.2s;
        }
        .ctrl-select:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .ctrl-select option {
          background: #111;
          color: #fff;
        }
        .settings-panel {
          position: absolute;
          bottom: 110%;
          background: rgba(20, 20, 20, 0.9);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px;
          border-radius: 16px;
          width: 240px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          opacity: 0;
          transform: translateY(10px) scale(0.95);
          pointer-events: none;
          transition: all 0.2s var(--ease-in-out);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        .settings-panel.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .setting-label {
          font-weight: 500;
        }
        .toggle-switch {
          position: relative;
          width: 40px;
          height: 22px;
          cursor: pointer;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #333;
          transition: 0.3s;
          border-radius: 22px;
        }
        .slider:before {
          position: absolute;
          content: '';
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: var(--accent);
        }
        input:checked + .slider:before {
          transform: translateX(18px);
        }
        .speed-opts {
          display: flex;
          background: #333;
          border-radius: 8px;
          padding: 2px;
        }
        .speed-btn {
          flex: 1;
          background: none;
          border: none;
          color: #aaa;
          font-size: 0.75rem;
          padding: 4px 8px;
          cursor: pointer;
          border-radius: 6px;
          transition: 0.2s;
        }
        .speed-btn.active {
          background: #555;
          color: #fff;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
