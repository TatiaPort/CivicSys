// backend/src/services/blockchainService.ts

// Clase experta en hablar con la Blockchain
export class BlockchainService {
  async getData() {
    return { mensaje: "Datos simulados de la roca Blockchain" };
  }

  async setData(texto: string) {
    console.log(`Guardando en la cadena: ${texto}`);
    return { hash: "0xHashFalso123" };
  }
}

// Exportamos una única instancia para que todo el backend use la misma conexión
export const blockchainService = new BlockchainService();