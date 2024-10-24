
const Popup = ({ data, onClose }) => {
    if (!data) return null;

    const popupStyle = {
        position: 'absolute',
        top: data.position.y - 50, // Positionne la popup juste au-dessus du matériau
        left: data.position.x,
        backgroundColor: 'black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 0 25px rgba(0, 0, 0, 1.5)',
        zIndex: 1000, // Assure que la popup soit au-dessus des autres éléments
        userSelect: 'none',
        
        
    };
    const h2Style = {
        margin: '0', // Enlève les marges par défaut
        padding: '0', // Enlève le remplissage si nécessaire
    };
    return (
        <div style={popupStyle}>
            <h2 style={h2Style}>{data.type.charAt(0).toUpperCase() + data.type.slice(1)}</h2>
            <p>Pos: {`${data.position.x.toFixed(2)}, ${data.position.y.toFixed(2)}`}</p>
            <p>Quantity:  {`${data.quantity}`}</p>

            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default Popup;
