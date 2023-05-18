import hana from '@sap/hana-client';

export function consultas(SqlQuery, callback) {
    console.log("Sentencia: " + SqlQuery);

    const connParams = {
        serverNode: '192.168.0.154:30015',
        uid: 'SYSTEM',
        pwd: 'B1Admin$'
    };

    const conn = hana.createConnection(connParams);

    conn.connect((err) => {
        if (err) {
            callback(err);
            return;
        }

        conn.exec(SqlQuery, (err, result) => {
            if (err) {
                callback(err);
            } else {
                callback(null, result);
            }

            conn.disconnect();
        });
    });
}

export function insertOrder(insertSql, insertParams, callback) {
    const connParams = {
        serverNode: '192.168.0.154:30015',
        uid: 'SYSTEM',
        pwd: 'B1Admin$'
    };

    const conn = hana.createConnection(connParams);

    conn.connect((connErr) => {
        if (connErr) {
            console.error('Error al establecer la conexión:', connErr);
            conn.disconnect();
            return;
        }

        console.log('Conexión establecida correctamente');

        // Ejemplo de inserción de datos
        conn.exec(insertSql, insertParams, (insertErr, affectedRows) => {
            if (insertErr) {
                console.error('Error al insertar datos:', insertErr);
                conn.disconnect();
                return;
            }

            console.log('Filas afectadas por la inserción:', affectedRows);

            // Consulta adicional para obtener la última ORDEN
            conn.exec(`SELECT U.* FROM GRUPO_EMPRESARIAL_HT.HT_ORDERS AS U JOIN (SELECT CURRENT_IDENTITY_VALUE() AS ID FROM DUMMY) AS I ON U.ID = I.ID`, (err, rows) => {
                if (err) {
                    console.error('Error al obtener la última ORDEN:', err);
                    callback(err);
                } else {
                    const lastInserted = rows[0];
                    callback(null, lastInserted);
                }

                conn.disconnect();
            });
        });
    });
}
