import {of, combineLatest} from "rxjs";

const height$ = of(1.73, 1.85, 1.55);
const weight$ = of(80, 72);



const bim$ = combineLatest([height$, weight$]);
bim$.subscribe(([h, w]) => {
    console.log(w / (h * h));
});



