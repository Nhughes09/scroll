import './LiquidButton.css';

export default function LiquidButton({ children, onClick }) {
    return (
        <button className="liquid-button" onClick={onClick}>
            <span className="liquid-button-text">{children}</span>
            <div className="liquid-button-blob"></div>
        </button>
    );
}
