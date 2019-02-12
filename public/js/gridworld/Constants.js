const colors = {
    RED:        '#FF0000',
    GREEN:      '#00FF00',
    LIGHTBLUE:  '#00BCF2',
    BLUE:       '#0000FF',
    PURPLE:     '#7027C3',
    YELLOW:     '#FFFF00',
    GREY:       '#646464'
};

const object_to_idx = {
    unseen: 0,
    empty:  1,
    wall:   2,
    floor:  3,
    door:   4,
    key:    5,
    ball:   6,
    box:    7,
    goal:   8,
    lava:   9,
    agent:  10,
    mark:   11
};

const action_to_idx = {
    right:     0,
    down:      1,
    left:      2,
    up:        3
};

const dirs = [[1,0], [0,1], [-1,0], [0,-1]];
