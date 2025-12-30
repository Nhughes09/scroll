import SplitText from '../components/SplitText';

export default function ProblemSection() {
    return (
        <section className="scroll-section" id="research">
            <div className="section-content minimal">
                <h2 className="headline">
                    <SplitText useGradient={true}>Research That Drives Decisions</SplitText>
                </h2>
                <p className="subtext">
                    <SplitText delay={0.1}>
                        Rigorous analysis integrating primary research, proprietary datasets, and structured frameworks to deliver actionable intelligence.
                    </SplitText>
                </p>
            </div>
        </section>
    );
}
