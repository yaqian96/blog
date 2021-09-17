import Taro from '@tarojs/taro';

const resolveReduis = (r: number | number[]): [number, number, number, number] => {
  if (Array.isArray(r)) {
    const len = r.length;
    if (len < 1 || r.every(c => c <= 0)) {
      return [0, 0, 0, 0];
    }
    const first = r[0];
    if (len === 1) {
      return [first, first, first, first];
    }
    const second = r[1];
    if (len === 2) {
      return [first, second, first, second];
    }
    const third = r[2];
    if (len === 3) {
      return [first, second, third, second];
    }
    return r as [number, number, number, number];
  }

  if (!r || r < 0) return [0, 0, 0, 0];

  return [r, r, r, r];
}

const drawLineThroght = (ctx: Taro.CanvasContext, {
  top = 0,
  left = 0,
  width = 0,
  height = 0
}) => {
  ctx.fillRect(left, top, width, height);
  ctx.fill();
}

export enum DrawerShapes {
  RoundImage = 11,
  Image,
  Rect,
  Text,
  Round
}

type DrawResult = {
  left: number;
  top: number;
  width: number;
  height: number;
}

const drawTextLine = (ctx: Taro.CanvasContext, {
  content = '',
  left = 0,
  top = 0,
  fontSize = 20,
  textDecoration = ''
}) => {
  if (textDecoration === 'underline') {
    drawLineThroght(ctx, {
      top: top + 2,
      left: left - 1,
      width: ctx.measureText(content).width + 3,
      height: 1
    })
  } else if (textDecoration === 'line-through') {
    drawLineThroght(ctx, {
      top: top - 0.4 * fontSize,
      left: left - 1,
      width: ctx.measureText(content).width + 3,
      height: 1
    })
  }
}

type DrawImageOption = {
  url: Taro.Image,
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  radius?: number;
  fit?: boolean;
  lineWidth?: number;
  strokeStyle?: string;
  imageWidth?: number;
  imageHeight?: number;
}

type DrawRectOption = {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  background?: string;
  radius?: number;
  rotate?: number;
  lineWidth?: number;
  shadowColor?: string;
  strokeStyle?: string;
  dialog?: number;
}

type DrawTextOption = {
  width?: number;
  content?: string;
  top?: number;
  left?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: number;
  textIndent?: number;
  textAlign?: string;
  textDecoration?: 'underline' | 'line-through' | 'none';
  baseline?: string;
  maxLineNum?: number;
  noBreakWord?: boolean;
}

type DrawTextResult = DrawResult & { lastWidth: number };

type DrawRoundImageOption = {
  url: Taro.Image;
  left?: number;
  top?: number;
  width?: number;
  strokeStyle?: string;
  lineWidth?: number;
}

type DrawRoundOption = {
  left?: number;
  top?: number;
  width?: number;
  strokeStyle?: string,
  lineWidth?: number;
  background?: string;
}

type LoadImageResult = { path: Taro.Image, height: number, width: number };

type ChildDraw<T extends DrawerShapes> = (arg: DrawResultT<T>) => OptinalDrawOption<T> | DrawOptionT | DrawOptionT[];

type OptinalDrawOption<T extends DrawerShapes> = Omit<DrawOption<T>, 'type'> | (Omit<DrawOption<T>, 'type'>[]);

type DrawResultT<T extends DrawerShapes> = T extends DrawerShapes.Text ? DrawTextResult : DrawResult;

type DrawOption<T extends DrawerShapes> = {
  type: T,
  childDraw?: ChildDraw<T>
} & (
    T extends DrawerShapes.Image ? DrawImageOption
      : T extends DrawerShapes.Rect ? DrawRectOption
        : T extends DrawerShapes.Round ? DrawRoundOption
          : T extends DrawerShapes.RoundImage ? DrawRoundImageOption
            : T extends DrawerShapes.Text ? DrawTextOption
              : never
  )

type DrawOptionT = {
  [key in DrawerShapes]: DrawOption<key>
}[DrawerShapes]

export class CanvasDrawer {
  ctx: Taro.CanvasContext;
  canvas: Taro.Canvas;

  constructor (ctx: Taro.CanvasContext, canvas: Taro.Canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  drawImage ({
    url,
    left = 0,
    top = 0,
    width = 200,
    height = 200,
    radius = 0,
    fit = false,
    lineWidth = 0,
    strokeStyle,
    imageWidth = 750,
    imageHeight = 750
  }: DrawImageOption): DrawResult {
    const ctx = this.ctx;
    ctx.save();
    if (lineWidth && strokeStyle) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
    }
    const [topLeft, topRight, bottomRight, bottomLeft] = resolveReduis(radius);
    ctx.beginPath();
    ctx.moveTo(left, top + topLeft);
    // top left raduis
    if (topLeft > 0) {
      ctx.quadraticCurveTo(left, top, left + topLeft, top);
    }
    ctx.lineTo(left + width - topRight, top);
    // top right raduis
    if (topRight > 0) {
      ctx.quadraticCurveTo(left + width, top, left + width, top + topRight);
    }
    ctx.lineTo(left + width, top + height - bottomRight);
    // bottom right raduis
    if (bottomRight > 0) {
      ctx.quadraticCurveTo(left + width, top + height, left + width - bottomRight, top + height);
    }

    ctx.lineTo(left + bottomLeft, top + height);
    // bottom left raduis
    if (bottomLeft > 0) {
      ctx.quadraticCurveTo(left, top + height, left, top + height - bottomLeft);
    }
    ctx.closePath();
    if (lineWidth) {
      ctx.stroke();
    }
    ctx.clip();
    if (fit) {
      const fitHeight = Math.floor((imageHeight * width) / imageWidth);
      if (height > fitHeight) {
        ctx.drawImage(url as unknown as string, 0, 0, imageWidth, imageHeight, left, top + (height - fitHeight) / 2, width, fitHeight);
      } else {
        ctx.drawImage(url as unknown as string, 0, 0, imageWidth, imageHeight, left, top, width, fitHeight);
        // ctx.drawImage(url, 0, 0, imageWidth, fitHeight, left, top, width, height);
      }
    } else {
      ctx.drawImage(url as unknown as string, left, top, width, height);
    }
    ctx.restore();
    return { left, top, width, height };
  }

  drawRect ({
    left = 0,
    top = 0,
    width = 0,
    height = 0,
    background,
    radius = 0,
    rotate = 0,
    lineWidth = 0,
    shadowColor,
    strokeStyle,
    dialog = 0,
  }: DrawRectOption): DrawResult {
    const { ctx } = this
    ctx.save();
    if (background) {
      ctx.fillStyle = background;
    }

    if (lineWidth && strokeStyle) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
    }

    if (rotate) {
      const x = left + width / 2;
      const y = top + height / 2;
      ctx.translate(x, y);
      ctx.rotate(Math.PI * rotate / 180);
      ctx.translate(-x, -y);
    }

    if (shadowColor) {
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      // @ts-ignore
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = 'rgba(0,0,0,0)' as unknown as number;
      ctx.shadowBlur = 0;
    }

    const [topLeft, topRight, bottomRight, bottomLeft] = resolveReduis(radius);

    ctx.beginPath();
    ctx.moveTo(left + topLeft, top);
    ctx.lineTo(left + width - topRight, top);
    if (topRight > 0) {
      ctx.quadraticCurveTo(left + width, top, left + width, top + topRight);
    }
    if (dialog > 0) {
      const stop = top + height / 2 - dialog / 2;
      ctx.lineTo(left + width, stop);
      ctx.lineTo(left + width + dialog + 8, stop - 8);
      ctx.lineTo(left + width, stop + dialog + 8);
    }
    ctx.lineTo(left + width, top + height - bottomRight);
    if (bottomRight > 0) {
      ctx.quadraticCurveTo(left + width, top + height, left + width - bottomRight, top + height);
    }
    ctx.lineTo(left + bottomLeft, top + height);
    if (bottomLeft > 0) {
      ctx.quadraticCurveTo(left, top + height, left, top + height - bottomLeft);
    }
    ctx.lineTo(left, top + topLeft);
    if (topLeft > 0) {
      ctx.quadraticCurveTo(left, top, left + topLeft, top);
    }
    ctx.closePath();
    if (lineWidth) {
      ctx.stroke();
    }
    if (background) {
      ctx.fill();
    }
    ctx.restore();
    return { left, top, width, height };
  }

  drawText ({
    width = 750,
    content = '',
    top = 0,
    left = 0,
    color = 'black',
    fontSize = 20,
    fontWeight = 'normal',
    fontFamily = 'sans-serif',
    lineHeight = 30,
    textIndent = 0,
    textAlign = 'left',
    textDecoration = 'none',
    baseline = 'normal',
    maxLineNum = 2,
    noBreakWord = false
  }: DrawTextOption): DrawTextResult {
    const { ctx } = this;
    let wordWidth = 0;
    ctx.save();
    ctx.beginPath();
    ctx.font = `normal ${fontWeight} ${fontSize}px ${fontFamily}`;
    // @ts-ignore
    ctx.textBaseline = baseline;
    ctx.fillStyle = color;
    // @ts-ignore
    ctx.textAlign = textAlign;
  
    let lineNumber = 1;
    if (noBreakWord) {
      ctx.fillText(content, left + textIndent, top);
      wordWidth = ctx.measureText(content).width;
      drawTextLine(ctx, {
        content,
        left,
        top,
        fontSize,
        textDecoration
      })
    } else {
      let word = '';
      let sTop = top;
  
      for (let index = 0, len = content.length;index < len;index++) {
        word += content[index];
        let _wordWidth = ctx.measureText(word).width;
        if (lineNumber === 1) {
          _wordWidth += textIndent;
        }
        wordWidth = _wordWidth;
        let realWidth = Array.isArray(width) ? width[lineNumber - 1] : width;
        if (_wordWidth > realWidth) {
          wordWidth = realWidth;
          const lineLeft = lineNumber === 1 ? left + textIndent : left;
          if (lineNumber === maxLineNum && index !== content.length) {
            word = word.substring(0, word.length - 2) + '...';
            ctx.fillText(word, lineLeft, sTop);
            drawTextLine(ctx, {
              content: word,
              left: lineLeft,
              top: sTop,
              fontSize,
              textDecoration
            });
            word = '';
            break;
          }
          const lastWord = word.substr(-1, 1);
          word = word.substring(0, word.length - 1);
          ctx.fillText(word, lineLeft, sTop);
          drawTextLine(ctx, {
            content: word,
            left: lineLeft,
            top: sTop,
            fontSize,
            textDecoration
          });
          word = lastWord;
          sTop += lineHeight
          lineNumber += 1;
        }
      }
      const lineLeft = lineNumber === 1 ? left + textIndent : left;
      ctx.fillText(word, lineLeft, sTop);
      drawTextLine(ctx, {
        content: word,
        left: lineLeft,
        top: sTop,
        fontSize,
        textDecoration,
      });
    }
    ctx.restore();
    if (lineNumber <= 1) {
      return { left, top, width: wordWidth, height: lineHeight, lastWidth: wordWidth }
    } else {
      return { left, top, width, height: lineHeight * lineNumber, lastWidth: wordWidth }
    }
  }

  drawRoundImage({
    url,
    left = 0,
    top = 0,
    width = 40,
    strokeStyle,
    lineWidth,
  }: DrawRoundImageOption): DrawResult {
    const { ctx } = this;
    ctx.save();
    const r = width / 2;
    const cx = left + r;
    const cy = top + r;
    ctx.beginPath();
    if (strokeStyle && lineWidth) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
    }
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    if (strokeStyle && lineWidth) {
      ctx.stroke();
    }
    ctx.clip();
    ctx.drawImage(url as unknown as string, left, top, width, width);
    ctx.restore();
    return { top, left, width, height: width }
  }

  /**
   * 前面加载失败，加载后面的
   */
  loadImage (...args: string[]): Promise<LoadImageResult> {
    const { canvas } = this
  
    const doIt = (src: string): Promise<LoadImageResult> => Taro.getImageInfo({ src }).then((result) => {
      let { path } = result;
      path = /^component|pkgs/.test(path) ? `/${path}` : path;
  
      return new Promise((resolve, reject) => {
        const img = canvas.createImage();
        img.src = path;
        img.onload = () => {
          resolve({ ...result, path: img });
        }
        img.onerror = error => {
          console.log('[poster] load image error', src, path);
          reject(error);
        };
      })
    });

    let ret: Promise<LoadImageResult> = Promise.reject(new Error('url required'));

    args.forEach(item => {
      ret = ret.catch(() => doIt(item));
    });

    return ret;
  }

  drawRound ({
    left = 0,
    top = 0,
    width = 40,
    strokeStyle,
    lineWidth,
    background,
  }: DrawRoundOption): DrawResult {
    const { ctx } = this;
    ctx.save();
    const r = width / 2;
    const cx = left + r;
    const cy = top + r;
    if (strokeStyle && lineWidth) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
    }
    if (background) {
      ctx.fillStyle = background;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    if (strokeStyle && lineWidth) {
      ctx.stroke();
    }
    if (background) {
      ctx.fill();
    }
    ctx.clip();
    ctx.restore();
    return { top, left, width, height: width }
  }

  draw (options: DrawOptionT[] | DrawOptionT) {
    const drawChild = <T extends DrawerShapes> (type: T, p: DrawResultT<T>, arg?: ChildDraw<T>) => {
      if (typeof arg === 'function') {
        let result = arg(p)
        if (Array.isArray(result)) {
          result.forEach(c => {
            this.draw({ type, ...c })
          });
        } else {
          this.draw({ type, ...result } as DrawOptionT);
        }
      }
    }

    const realDraw = (param?: DrawOptionT) => {
      if (!param) return;
      switch (param.type) {
        case DrawerShapes.Image: {
          const { childDraw, ...drawOption } = param;
          drawChild(DrawerShapes.Image, this.drawImage(drawOption), childDraw);
          break;
        }
        case DrawerShapes.Rect: {
          const { childDraw, ...drawOption } = param;
          drawChild(DrawerShapes.Rect, this.drawRect(drawOption), childDraw);
          break;
        }
        case DrawerShapes.Text: {
          const { childDraw, ...drawOption } = param;
          drawChild(DrawerShapes.Text, this.drawText(drawOption), childDraw);
          break;
        }
        case DrawerShapes.RoundImage: {
          const { childDraw, ...drawOption } = param;
          drawChild(DrawerShapes.RoundImage, this.drawRoundImage(drawOption), childDraw);
          break;
        }
        case DrawerShapes.Round: {
          const { childDraw, ...drawOption } = param;
          drawChild(DrawerShapes.Round, this.drawRound(drawOption), childDraw);
          break;
        }
      }
    }
    if (Array.isArray(options)) {
      options.forEach(realDraw);
    } else {
      realDraw(options);
    }
  }
}

