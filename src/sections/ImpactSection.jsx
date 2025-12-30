import SplitText from '../components/SplitText';

export default function ImpactSection() {
    return (
        <section className="scroll-section" id="consulting">
            <div className="section-content minimal">
                <h2 className="headline">
                    <SplitText useGradient={true}>Custom Research & Advisory</SplitText>
                </h2>
                <p className="subtext">
                    <SplitText delay={0.1}>
                        Bespoke research and strategic advisory tailored to your specific questions, timelines, and decision requirements.
                    </SplitText>
                </p>
            </div>
        </section>
    );
}
