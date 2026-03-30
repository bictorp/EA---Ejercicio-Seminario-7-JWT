export interface IJwtPayload {
    id: string;
    name: string;
    email: string;
    organizacion: string;
    //Ejercicio JWT:
    //Agregamos el rol al payload.
    role: string;
}
