import multer from 'multer';

export enum StoreInEnum {
    Memory = 'memory',
    Storgae = 'storage',
}


export const multerFile = ({ storeIn = StoreInEnum.Memory } : { storeIn? : StoreInEnum }) => {

    const storage = storeIn === StoreInEnum.Memory ? multer.memoryStorage() : multer.diskStorage({}) ;
    return multer({ storage });
}
