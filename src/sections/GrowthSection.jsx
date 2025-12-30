import SplitText from '../components/SplitText';

const platforms = [
    {
        name: 'MarketResearch.com',
        description: 'Browse our complete library of published research.',
        link: 'https://www.marketresearch.com/HHeuristics-v4344/',
    },
    {
        name: 'Substack',
        description: 'Subscribe for regular insights and analysis.',
        link: 'https://hheuristics.substack.com',
    },
    {
        name: 'Upwork',
        description: 'Engage our team for custom projects.',
        link: 'https://www.upwork.com/agencies/1987574673660266609/',
    },
];

export default function GrowthSection() {
    return (
        <section className="scroll-section" id="data">
            <div className="section-content wide">
                <h2 className="headline">
                    <SplitText useGradient={true}>Access Our Work</SplitText>
                </h2>

                <div className="card-grid">
                    {platforms.map((platform, i) => (
                        <a key={i} href={platform.link} className="card" target="_blank" rel="noopener noreferrer">
                            <h3>{platform.name}</h3>
                            <p>{platform.description}</p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
