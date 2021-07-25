export const shuffle = function (inArray: any[]): any[] {
    let array = [...inArray];
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

export const lastValuesGreater = function (arr: number[], numValues: number, value: number): boolean {
    if (arr.length >= numValues) {
        if (!arr.slice(-numValues).find((n) => n < value)) {
            return true;
        }
    }
    return false;
}

export const delay = function (delay) {
    return new Promise(function (resolve) {
        setTimeout(resolve, delay);
    });
}
