export const colorMap = {
    'participant': '#f05163',
    'volunteer': '#4a82f7'
};

export const icon = (type, label) => {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="27" height="27"><circle cx="13" cy="13" r="12" stroke="#333" fill="'+colorMap[type]+'"/><text x="13" y="14" text-anchor="middle" alignment-baseline="middle" style="text-shadow:0 0 5px #333" fill="#fff" font-family="Arial" font-size="12">'+label+'</text></svg>'
};

export const num2time = (num) => {
    let hr = Math.trunc(num) % 12,
        min = '00' + Math.trunc((num % 1) * 60);
    if(hr==0) hr = 12;
    return `${hr}:${min.slice(-2)}`
};
