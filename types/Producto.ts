export interface Producto {
    id_producto: number;
    codigo_sm: string;
    nombre: string;
    id_marca: number;
    referencia: string;
    descripcion: string;
    precio: number;
    cantidad_fisica: number;
    cantidad_despachada: number;
    cantidad_solicitada: number;
    id_detalle: number;
}