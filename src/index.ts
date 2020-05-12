import {from} from "rxjs";

function getName(name: string) {
    from([1, 2, 3]).subscribe((data: number) => {
        console.log(data);
    });
}

getName('tony');
