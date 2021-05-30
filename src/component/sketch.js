export default function sketch(p) {
    var colors = {};
    var w = p.windowWidth;
    var h = p.windowHeight;
    var ref;

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.background(0, 0, 0, 255);
        ref = Math.min(w,h);
    }

    p.myCustomRedrawAccordingToNewPropsHandler = ({index, tickers, feeds, volumes, ranges}) => {
        if (index && tickers && feeds && volumes && ranges) {
            p.clear();
            p.background(0, 0, 0, 255);
            tickers.forEach((tk, i) => {
                if (!colors.hasOwnProperty(tk)) {
                    colors = tickers.reduce((acc, curr) => {
                        acc[curr] = {
                            r: p.random(255),
                            g: p.random(255),
                            b: p.random(255),
                        };
                        return acc;
                    }, {});                    
                }
                let daily = feeds[tk][index];
                p.noStroke();
                let percent = daily.volume / volumes[tk];
                p.fill(colors[tk].r, colors[tk].g, colors[tk].b, 255 * percent * 0.9);
                p.ellipse(w/2, h/2, ref * percent, ref * percent);

                p.fill(colors[tk].r, colors[tk].g, colors[tk].b, 255);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(ref / tickers.length * (percent*0.8 + 0.2));
                p.text(tk, w/2, h/2 + ref * (i-2) / tickers.length);
            });
        }
    };

    p.draw = () => {
    }
}