//Sentecia consultar el usuario
export const SqlQuerySignIn = (usuario) => 'SELECT * FROM "GRUPO_EMPRESARIAL_HT"."HT_USERS" WHERE "EMAIL" LIKE \'' + usuario + '\'';

// export const SqlQuerySignIn = (usuario) => {
//    return  'SELECT * FROM "GRUPO_EMPRESARIAL_HT"."ht_users" WHERE "user_login" LIKE \'' + usuario + '\'';
// }

//Sentecia para crear un nuevo usuario
export const SqlInsertUser = ( { DISPLAYNAME, EMAIL, PASSWORD, PHOTOURL, PHONENUMBER, COUNTRY, ADDRESS, STATE, CITY, ZIPCODE, ABOUT, ROLE, ISPUBLIC } ) => {
    return `INSERT INTO GRUPO_EMPRESARIAL_HT.HT_USERS (
    DISPLAYNAME,
    EMAIL,
    PASSWORD,
    PHOTOURL,
    PHONENUMBER,
    COUNTRY,
    ADDRESS,
    STATE,
    CITY,
    ZIPCODE,
    ABOUT,
    ROLE,
    ISPUBLIC
  ) VALUES (
    '${DISPLAYNAME || null}',
    '${EMAIL || null}',
    '${PASSWORD || null}',
    '${PHOTOURL || null}',
    '${PHONENUMBER || null}',
    '${COUNTRY || null}',
    '${ADDRESS || null}',
    '${STATE || null}',
    '${CITY || null}',
    '${ZIPCODE || null}',
    '${ABOUT || null}',
    '${ROLE || 'user'}',
    ${ISPUBLIC}
  )`;
}



