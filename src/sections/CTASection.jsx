import SplitText from '../components/SplitText';

export default function CTASection() {
    return (
        <section className="cta-container scroll-section" id="contact">
            <div className="section-content minimal">
                <h2 className="headline">
                    <SplitText useGradient={true}>Need Custom Research?</SplitText>
                </h2>
                <p className="subtext">
                    <SplitText delay={0.1}>
                        Let's discuss your requirements.
                    </SplitText>
                </p>
                <button className="cta-button">Get Started</button>
            </div>
        </section>
    );
}
