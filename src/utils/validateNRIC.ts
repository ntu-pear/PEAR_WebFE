
export const validateNRIC = (nric: string = "G5872776N"): Boolean => {
    let sum = 0;
    const weights = [2, 7, 6, 5, 4, 3, 2]
    const digits = nric.slice(1, 8).split("").map(Number);
    digits.forEach((num, index) => {
        sum += num * weights[index]
    })
    if (nric[0].toUpperCase() === "G" || nric[0].toUpperCase() === "T") {
        sum += 4
    }
    else if (nric[0].toUpperCase() === "M") {
        sum += 3
    }
    const stTable = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "Z", "J"]
    const gfTable = ["K", "L", "M", "N", "P", "Q", "R", "T", "U", "W", "X"]
    const mTable = ["K", "L", "J", "N", "P", "Q", "R", "T", "U", "W", "X"]
    
    const remainder = sum%11
    const checkdigit = 11-(remainder+1)
    if (nric[0].toUpperCase() === "S" || nric[0].toUpperCase() === "T") {
        return stTable[checkdigit] === nric[nric.length - 1].toUpperCase()
    }
    else if (nric[0].toUpperCase() === "G" || nric[0].toUpperCase() === "F") {
        return gfTable[checkdigit] === nric[nric.length - 1].toUpperCase()
    }
    else if (nric[0].toUpperCase() === "M") {
        return mTable[checkdigit] === nric[nric.length - 1].toUpperCase()
    } else {
        return false
    }
}