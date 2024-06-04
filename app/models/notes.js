module.exports =  (sequelize, Sequelize) => {
    const Notes = sequelize.define('Notes', {
        NoteId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeID: {
            type: Sequelize.INTEGER(50),
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        projectId: {
            type: Sequelize.INTEGER(50),
        },
        Description: {
            type: Sequelize.TEXT
        },
        title: {
            type: Sequelize.TEXT
        }
    }, {
        timestamps: true,
    });
    Notes.sync();
    return Notes;
}