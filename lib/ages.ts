export interface AgeBracket {
    name: string;
    minAge: number;
    maxAge: number;
}
export const ageBrackets = [
    {name: 'All', minAge: 0, maxAge: 999},
    {name: '<16', minAge: 0, maxAge: 15},
    {name: '16-19', minAge: 16, maxAge: 19},
    {name: '20-34', minAge: 20, maxAge: 34},
    {name: '35-49', minAge: 35, maxAge: 49},
    {name: '50+', minAge: 50, maxAge: 999},
]
