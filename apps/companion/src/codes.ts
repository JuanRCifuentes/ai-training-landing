/** No 0/o, 1/l/i, so a code read aloud or copied by hand survives. */
const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';

/** Bytes at or above this are dropped, so every character is equally likely. */
const unbiasedLimit = 256 - (256 % alphabet.length);

function random(length: number): string {
	let code = '';
	while (code.length < length) {
		for (const b of crypto.getRandomValues(new Uint8Array(length))) {
			if (b < unbiasedLimit && code.length < length) code += alphabet[b % alphabet.length];
		}
	}
	return code;
}

/** Cohort codes go in a shared URL and unlock only public content, so they are short. */
export const newCohortCode = () => `g-${random(8)}`;
/** Personal codes act as the student's password for their progress (12 characters, about 59 bits). */
export const newStudentCode = () => `a-${random(12)}`;
/** Team lead tokens open the progress page of a whole group, so they are longer. */
export const newLeadToken = () => `e-${random(24)}`;

export const isCohortCode = (code: string) => /^g-[2-9a-z]{8}$/.test(code);
export const isStudentCode = (code: string) => /^a-[2-9a-z]{12}$/.test(code);
export const isLeadToken = (code: string) => /^e-[2-9a-z]{24}$/.test(code);

export async function sha256(value: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
