export default function sketch(p) {
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.background(0, 0, 0, 255);
    }

    p.myCustomRedrawAccordingToNewPropsHandler = ({index, tickers, feeds, volumes, ranges}) => {
        if (index && tickers && feeds && volumes && ranges) {
            p.clear();
            p.background(0, 0, 0, 255);
            let w = p.windowWidth;
            let h = p.windowHeight;
            tickers.forEach((tk) => {
                let daily = feeds[tk][index];
                p.noStroke();
                let size = Math.min(w,h) * daily.volume / volumes[tk];
                p.fill(p.random(255), p.random(255), p.random(255), 255 * size / Math.min(w,h));
                p.ellipse(w/2, h/2, size, size);
            });
        }
    };

    p.draw = () => {
    }
}