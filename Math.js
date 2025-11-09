export default class Math{
    static clamp(value,min,max){
        if(min == max)
            return min
        if(min>max)
            throw new Error("min is greater than max")
        if(value < min)
            return min;
        if(value > max)
            return max;

        return value;
    }

    static lerp(a,b,t){
        return a + (b-a) * t;
    }

    static min(a,b){
        return a < b ? a : b;
    }

    static max(a,b){
        return a > b ? a : b;
    }   
}