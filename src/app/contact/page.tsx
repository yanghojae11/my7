export default function Contact() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">문의하기</h1>
      <section className="space-y-4">
        <p>정책 정보나 지원사업 관련 문의는 아래 연락처로 보내주세요.</p>
        <ul className="space-y-2">
          <li>일반 문의: <a href="mailto:contact@my7.co.kr" className="underline text-blue-600">contact@my7.co.kr</a></li>
          <li>정책 제보: <a href="mailto:tips@my7.co.kr" className="underline text-blue-600">tips@my7.co.kr</a></li>
          <li>기술 지원: <a href="mailto:support@my7.co.kr" className="underline text-blue-600">support@my7.co.kr</a></li>
        </ul>
        <div className="bg-blue-50 p-4 rounded-lg mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">정부 지원사업 문의</h3>
          <p className="text-blue-700 text-sm">
            직접적인 지원사업 신청이나 상담은 해당 정부 기관에 직접 문의하시기 바랍니다.
            저희는 정보 제공 만을 담당하고 있습니다.
          </p>
        </div>
        <p>빠른 답변을 위해 이메일로 문의해 주세요.</p>
      </section>
    </main>
  );
}
