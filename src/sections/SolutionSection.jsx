import SplitText from '../components/SplitText';

const reports = [
    {
        title: 'Financial Technology',
        description: 'Fintech disruption, embedded finance, and digital banking transformation.',
        tag: 'Technology',
    },
    {
        title: 'Business Intelligence & Analytics',
        description: 'BI platforms outlook through 2030, AI integration, vendor positioning.',
        tag: 'Analytics',
    },
    {
        title: 'Cloud FinOps',
        description: 'Cost optimization frameworks and governance for enterprise cloud.',
        tag: 'Cloud',
    },
];

export default function SolutionSection() {
    return (
        <section className="scroll-section" id="reports">
            <div className="section-content wide">
                <h2 className="headline">
                    <SplitText useGradient={true}>Featured Reports</SplitText>
                </h2>
                <p className="subtext">
                    <SplitText delay={0.1}>
                        Strategic intelligence across technology, finance, and markets.
                    </SplitText>
                </p>

                <div className="card-grid">
                    {reports.map((report, i) => (
                        <div key={i} className="card">
                            <span className="card-label">{report.tag}</span>
                            <h3>{report.title}</h3>
                            <p>{report.description}</p>
                            <a href="#" className="card-link">View Report →</a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
