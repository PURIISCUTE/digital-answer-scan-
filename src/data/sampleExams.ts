import { MasterMarkingScheme, StudentPaperSample } from '../types/grading';

export const SAMPLE_EXAMS: MasterMarkingScheme[] = [
  {
    id: 'physics-2026',
    title: 'Advanced AP Physics: Quantum & Thermodynamics',
    subject_exam: 'AP Physics C - Section II (Theoretical)',
    total_marks: 25,
    questions: [
      {
        id: 'phys-q1',
        question_number: 'Q1',
        question_prompt: 'Derive the theoretical maximum efficiency of a Carnot heat engine operating between hot reservoir Th and cold reservoir Tc, and state why 100% efficiency is physically impossible.',
        master_scheme_answer: 'Carnot efficiency is η = 1 - (Tc / Th). 100% efficiency (η = 1) requires Tc = 0 K (absolute zero), which violates the Third Law of Thermodynamics, or Th = ∞ which is physically unrealizable. Furthermore, the Kelvin-Planck statement of the Second Law dictates that no engine operating in a cycle can convert all absorbed heat into work without discharging heat to a colder sink.',
        key_concepts: 'η = 1 - (Tc/Th), Absolute zero Tc=0 K unattainable, Second Law Kelvin-Planck statement, Third law, heat rejected to cold sink.',
        partial_credit_rules: 'Award 3 marks for correct mathematical formula derivation with Th and Tc; award 3 marks for thermodynamic reasoning (Second/Third Law and impossibility of absolute zero sink). Deduct 1 mark if Kelvin scale is not specified.',
        max_marks: 6,
      },
      {
        id: 'phys-q2',
        question_number: 'Q2',
        question_prompt: 'Explain the Photoelectric Effect experiment: state Einstein’s photoelectric equation, define work function (Φ), and explain why wave theory fails to explain the existence of a threshold frequency.',
        master_scheme_answer: 'Einstein’s equation is K_max = hf - Φ (or E = hν - W). The work function Φ is the minimum energy required to liberate an electron from the metal surface. Classical wave theory predicted that energy depends on intensity and that any frequency given sufficient time would accumulate enough energy to eject electrons. In reality, emission is instantaneous and occurs only if f >= f_0 (threshold frequency), proving light exists as quantized packets (photons) with energy E = hf.',
        key_concepts: 'K_max = hf - Φ, work function minimum liberation energy, wave theory intensity vs frequency failure, instantaneous ejection, photon quantization.',
        partial_credit_rules: 'Award 3 marks for the equation and correct definition of Φ; award 4 marks for contrasting wave theory (intensity/time lag) with quantum photon hypothesis (threshold frequency f0).',
        max_marks: 7,
      },
      {
        id: 'phys-q3',
        question_number: 'Q3',
        question_prompt: 'State de Broglie’s matter-wave hypothesis and compute the de Broglie wavelength of an electron (m_e = 9.11e-31 kg) accelerated through a potential difference of V = 150 Volts. (h = 6.626e-34 J·s, e = 1.6e-19 C).',
        master_scheme_answer: 'De Broglie stated λ = h / p = h / (m*v). Under potential V, kinetic energy K = eV = (1/2)mv^2, so momentum p = sqrt(2*m_e*e*V). Substituting: p = sqrt(2 * 9.11e-31 * 1.6e-19 * 150) = 6.615e-24 kg·m/s. Thus λ = 6.626e-34 / 6.615e-24 = 1.00e-10 m = 0.10 nm = 1.0 Å.',
        key_concepts: 'λ = h/p, p = sqrt(2m*e*V), kinetic energy = eV, calculated wavelength approximately 1.0e-10 m or 0.1 nm (acceptable range: 0.099 - 0.102 nm).',
        partial_credit_rules: 'Award 2 marks for stating hypothesis λ = h/p; award 2 marks for momentum formula derivation p = sqrt(2m*e*V); award 2 marks for correct calculation and unit (0.1 nm or 1.0 Å). Deduct 1 mark if units are missing or incorrect.',
        max_marks: 6,
      },
      {
        id: 'phys-q4',
        question_number: 'Q4',
        question_prompt: 'Explain the Heisenberg Uncertainty Principle: state the mathematical inequality for position and momentum, and explain why macroscopic objects do not exhibit noticeable quantum uncertainty.',
        master_scheme_answer: 'Heisenberg principle states Δx * Δp >= ħ / 2 (or h / 4π). It implies that the position and momentum of a particle cannot simultaneously be measured with arbitrary precision. For macroscopic objects (e.g. a baseball or car), mass m is extraordinarily large relative to Planck’s constant (h ~ 10^-34 J·s), so the resulting uncertainties in position and velocity (Δv = Δp / m) are order of 10^-30 m/s, completely undetectable beneath classical measurement limits.',
        key_concepts: 'Δx * Δp >= ħ/2, simultaneous measurement conjugate variables, macroscopic mass m is huge compared to tiny h (10^-34), undetectable uncertainty in everyday life.',
        partial_credit_rules: 'Award 3 marks for correct mathematical statement and physical interpretation; award 3 marks for macroscopic mass scale comparison relative to Planck constant h.',
        max_marks: 6,
      },
    ],
  },
  {
    id: 'biology-2026',
    title: 'Molecular Biology & Cellular Metabolism',
    subject_exam: 'BIO-301: Advanced Cellular Biochemistry',
    total_marks: 20,
    questions: [
      {
        id: 'bio-q1',
        question_number: 'Q1',
        question_prompt: 'Describe the net energetic yield of Glycolysis from one molecule of glucose under aerobic conditions, detailing substrate-level phosphorylation products.',
        master_scheme_answer: 'From 1 glucose molecule, glycolysis nets 2 ATP (4 ATP generated via substrate-level phosphorylation minus 2 ATP consumed in the preparatory investment phase), 2 NADH electron carriers, and 2 pyruvate molecules. No carbon dioxide is produced in glycolysis.',
        key_concepts: 'Net 2 ATP, 2 NADH, 2 pyruvate, substrate-level phosphorylation, investment vs payoff phase.',
        partial_credit_rules: 'Full credit (5/5) for specifying net 2 ATP, 2 NADH, and 2 pyruvate. Deduct 2 marks if student states gross 4 ATP without accounting for 2 ATP invested.',
        max_marks: 5,
      },
      {
        id: 'bio-q2',
        question_number: 'Q2',
        question_prompt: 'Explain how the mitochondrial electron transport chain establishes a proton gradient and how ATP synthase utilizes proton-motive force (chemiosmosis) to generate ATP.',
        master_scheme_answer: 'Electrons from NADH and FADH2 pass through Complexes I, III, and IV, driving the active pumping of H+ protons from the mitochondrial matrix into the intermembrane space. This creates an electrochemical proton gradient (proton-motive force). Protons flow down this gradient through the F0 rotor subunit of ATP synthase back into the matrix, causing rotational catalysis in the F1 catalytic head to phosphorylate ADP + Pi into ATP.',
        key_concepts: 'Complexes I, III, IV pump H+ into intermembrane space, electrochemical proton gradient (pmf), ATP synthase F0 rotor and F1 head, rotational catalysis, chemiosmosis.',
        partial_credit_rules: 'Award 4 marks for proton pumping mechanism & gradient location; award 4 marks for ATP synthase rotational catalytic mechanism coupling proton flow to ADP phosphorylation.',
        max_marks: 8,
      },
      {
        id: 'bio-q3',
        question_number: 'Q3',
        question_prompt: 'Differentiate between competitive and non-competitive enzyme inhibition in terms of Vmax and Km values, explaining the molecular basis for each.',
        master_scheme_answer: 'In competitive inhibition, the inhibitor binds directly to the active site, competing with the substrate. Vmax remains unchanged because high substrate concentration overcomes the inhibitor; Km increases (lower apparent affinity). In non-competitive (allosteric) inhibition, the inhibitor binds to an allosteric site altering enzyme conformation. Vmax decreases because effective catalytic capacity is reduced; Km remains unchanged because substrate binding affinity to the active site is unaltered.',
        key_concepts: 'Competitive: binds active site, Vmax unchanged, Km increased. Non-competitive: binds allosteric site, Vmax decreased, Km unchanged.',
        partial_credit_rules: 'Award 3.5 marks for competitive inhibition (active site, Vmax same, Km up); award 3.5 marks for non-competitive inhibition (allosteric site, Vmax down, Km same).',
        max_marks: 7,
      },
    ],
  },
  {
    id: 'cs-2026',
    title: 'Computer Science: Algorithms & Complexity',
    subject_exam: 'CS-402: Design & Analysis of Algorithms',
    total_marks: 25,
    questions: [
      {
        id: 'cs-q1',
        question_number: 'Q1',
        question_prompt: 'Explain Dijkstra’s single-source shortest path algorithm, its time complexity using a min-heap, and why it fails in graphs with negative weight edges.',
        master_scheme_answer: 'Dijkstra’s algorithm uses a greedy strategy: starting at the source, it iteratively extracts the vertex with minimum tentative distance from a priority queue (min-heap) and relaxes outgoing edges. With a binary min-heap, time complexity is O((V + E) log V). It fails on negative weight edges because once a vertex is marked visited/settled, Dijkstra assumes its shortest path is final; a negative edge discovered later could provide a shorter path, violating the greedy invariant.',
        key_concepts: 'Greedy choice, min-heap priority queue, edge relaxation, O((V+E) log V) complexity, negative edge failure due to premature finalization of visited vertices.',
        partial_credit_rules: 'Award 3 marks for algorithmic procedure and min-heap complexity; award 4 marks for rigorous explanation of greedy invariant breakdown on negative edges.',
        max_marks: 7,
      },
      {
        id: 'cs-q2',
        question_number: 'Q2',
        question_prompt: 'Analyze Quicksort: state the recurrence relations and time complexities for the best, average, and worst cases, and describe the Randomized Pivot strategy.',
        master_scheme_answer: 'Quicksort uses divide-and-conquer partitioning. Best case: T(n) = 2T(n/2) + O(n) -> O(n log n) with balanced medians. Average case: O(n log n) expected depth across permutations. Worst case: T(n) = T(n-1) + O(n) -> O(n^2) when pivot is always extreme (e.g. sorted array with first element pivot). Randomized pivot chooses pivot uniformly at random or uses median-of-three, guaranteeing O(n log n) expected time regardless of input ordering and eliminating deterministic adversarial worst cases.',
        key_concepts: 'Best case O(n log n), Average case O(n log n), Worst case O(n^2) unbalanced partitions, Randomized pivot uniform random selection, expected O(n log n).',
        partial_credit_rules: 'Award 4 marks for accurate recurrence and complexity derivations; award 4 marks for randomized pivot rationale and mitigation of worst-case adversarial inputs.',
        max_marks: 8,
      },
      {
        id: 'cs-q3',
        question_number: 'Q3',
        question_prompt: 'Define the two core conditions required to apply Dynamic Programming (Optimal Substructure and Overlapping Subproblems), contrasting top-down memoization with bottom-up tabulation.',
        master_scheme_answer: '1. Optimal Substructure: An optimal solution to the overall problem incorporates optimal solutions to its subproblems. 2. Overlapping Subproblems: The recursive problem space revisits the same smaller subproblems repeatedly rather than generating new subproblems. Top-down memoization preserves natural recursive call structure and caches results in a lookup table upon return. Bottom-up tabulation iteratively builds solutions starting from base cases in topological order, avoiding recursion call stack overhead and frequently allowing space optimization.',
        key_concepts: 'Optimal Substructure, Overlapping Subproblems, Top-down memoization recursive with cache, Bottom-up tabulation iterative table filling, call stack vs space optimization.',
        partial_credit_rules: 'Award 5 marks for defining the two conditions; award 5 marks for the comparative analysis of memoization vs tabulation.',
        max_marks: 10,
      },
    ],
  },
];

export const SAMPLE_STUDENT_PAPERS: StudentPaperSample[] = [
  {
    id: 'paper-alex-turner',
    student_name: 'Alex M. Turner',
    roll_number_id: 'PHY-2026-084',
    handwriting_style: 'neat',
    has_ambiguity: false,
    answers: [
      {
        question_number: 'Q1',
        student_text: 'Carnot efficiency is defined as eta = 1 - (Tc / Th). Here Th and Tc are the temperatures of the hot and cold reservoirs in Kelvin. 100% efficiency would mean eta = 1, requiring Tc = 0 K or Th = infinity. Reaching 0 K (absolute zero) is forbidden by the Third Law of Thermodynamics, and Kelvin-Planck statement of Second Law proves all cyclic engines must reject some waste heat to a cold sink.',
      },
      {
        question_number: 'Q2',
        student_text: 'Photoelectric equation is K_max = hf - Phi, where Phi is the work function (the minimum binding energy required to eject an electron). Classical wave theory thought light intensity governed ejection energy and that low-frequency light would eventually build up energy to emit electrons after a time delay. However, experiments proved emission is instantaneous and zero electrons emit if frequency f < f_0 (threshold frequency), proving light behaves as discrete quanta/photons of energy E = hf.',
      },
      {
        question_number: 'Q3',
        student_text: 'De Broglie stated lambda = h / p. Under voltage V = 150 V, kinetic energy is K = eV = (1/2)m v^2, so p = sqrt(2 * m_e * e * V). Plugging in: p = sqrt(2 * 9.11e-31 kg * 1.6e-19 C * 150 V) = sqrt(4.3728e-47) = 6.613e-24 kg m/s. Then lambda = 6.626e-34 / 6.613e-24 = 1.002 x 10^-10 m, which is approximately 0.10 nm or 1.0 Angstrom.',
      },
      {
        question_number: 'Q4',
        student_text: 'Heisenberg Uncertainty Principle gives delta_x * delta_p >= hbar / 2. We cannot know both position and momentum simultaneously with infinite precision. For macroscopic bodies like a tennis ball, mass m is very large while Planck constant h is roughly 6.6e-34 J s. Therefore delta_v = delta_p / m is around 10^-31 m/s, which is so microscopic that classical physics completely ignores it.',
      },
    ],
  },
  {
    id: 'paper-sarah-chen',
    student_name: 'Sarah Chen',
    roll_number_id: 'PHY-2026-119',
    handwriting_style: 'messy_smudged',
    has_ambiguity: true,
    answers: [
      {
        question_number: 'Q1',
        student_text: 'Efficiency formula is e = 1 - (Tc/Th). To get 100% efficiency, Tc must be 0 Kelvin. But absolute zero cannot be achieved according to thermodynamic laws. Also heat must be dumped into cold reservoir.',
      },
      {
        question_number: 'Q2',
        student_text: 'Kmax = h*f - phi. Work function phi is energy needed to kick out electron. Wave theory said more brightness gives more energy. But really threshold frequency f0 is needed because photons have fixed energy packets.',
      },
      {
        question_number: 'Q3',
        student_text: 'de Broglie: lambda = h/p = h/sqrt(2*m*e*V). Calculation: p = sqrt(2 * 9.11e-31 * 1.6e-19 * 150). [Note: handwriting smudged around exponent 10^-10 vs 10^-19]. Student wrote: lambda = 1.00 x 10^-?? m. Looks like 1.00 x 10^-10 m or 1.00 x 10^-19 m due to ink smudge on the exponent superscript.',
        deliberate_flaw: 'Smudge on exponent 10^-10 vs 10^-19',
        ambiguity_note: 'Exponent superscript is smudged with overlapping pen strokes. OCR confidence score is low (58.4%). Zero error tolerance flags this for human inspection.',
      },
      {
        question_number: 'Q4',
        student_text: 'Delta x * Delta p >= h / 4*pi. Macroscopic objects are too heavy so the uncertainty is too small to measure in lab.',
      },
    ],
  },
  {
    id: 'paper-marcus-vance',
    student_name: 'Marcus Vance',
    roll_number_id: 'PHY-2026-032',
    handwriting_style: 'cursive',
    has_ambiguity: false,
    answers: [
      {
        question_number: 'Q1',
        student_text: 'Carnot heat engine efficiency = 1 - Tc/Th. You cannot get 100% because cold sink Tc cannot reach absolute zero (-273.15 C) due to 3rd law. Also 2nd law states heat cannot be completely transformed into mechanical work in a cyclic system.',
      },
      {
        question_number: 'Q2',
        student_text: 'Einstein photoelectric formula: K_max = hf - W. W is work function. Classical wave theory failed because it predicted a time lag where energy would accumulate over minutes, and thought wave amplitude (intensity) determined electron kinetic energy. In reality photon energy depends on frequency f.',
      },
      {
        question_number: 'Q3',
        student_text: 'lambda = h/p. For electron: K = 150 eV = 150 * 1.6e-19 J = 2.4e-17 J. p = sqrt(2 * m * K) = sqrt(2 * 9.11e-31 * 2.4e-17) = 6.61e-24. lambda = 6.626e-34 / 6.61e-24 = 0.1002 nm.',
      },
      {
        question_number: 'Q4',
        student_text: 'Delta x times Delta p is greater than or equal to hbar/2. For big everyday objects, their huge mass makes delta x * delta v = hbar / (2m) practically zero.',
      },
    ],
  },
  {
    id: 'paper-elena-rodriguez',
    student_name: 'Elena Rodriguez',
    roll_number_id: 'BIO-2026-045',
    handwriting_style: 'neat',
    has_ambiguity: false,
    answers: [
      {
        question_number: 'Q1',
        student_text: 'Glycolysis yields a net of 2 ATP (4 ATP made, 2 ATP used up in investment phase), 2 NADH, and 2 pyruvate molecules per glucose. No CO2 is produced.',
      },
      {
        question_number: 'Q2',
        student_text: 'Complexes I, III, and IV pump protons (H+) from the mitochondrial matrix into the intermembrane space, setting up an electrochemical proton-motive force. As protons stream down their gradient back to the matrix through ATP synthase F0 rotor, the F1 subunit rotates and synthesizes ATP from ADP + Pi via chemiosmosis.',
      },
      {
        question_number: 'Q3',
        student_text: 'Competitive inhibitors bind to the active site directly: Vmax stays unchanged because adding enough substrate outcompetes it, but Km increases. Non-competitive inhibitors bind to an allosteric site: Vmax is lowered because enzyme efficiency drops, but Km remains unchanged.',
      },
    ],
  },
  {
    id: 'paper-devon-brooks',
    student_name: 'Devon Brooks',
    roll_number_id: 'CS-2026-077',
    handwriting_style: 'messy_smudged',
    has_ambiguity: true,
    answers: [
      {
        question_number: 'Q1',
        student_text: 'Dijkstra uses min-heap to pick closest unvisited node and relaxes edges. Runtime is O((V+E) log V). It fails on negative edges because once visited, the algorithm assumes distance is locked in, but a negative edge could make an already closed node shorter.',
      },
      {
        question_number: 'Q2',
        student_text: 'Quicksort average O(n log n), best O(n log n). Worst case is O(n^2) when array is sorted and pivot is first item. [Strikethrough / crossed out text]: Student crossed out half a paragraph with heavy ink scribbles and wrote "Random pivot prevents O(n^2) by picking pivot randomly".',
        deliberate_flaw: 'Crossed-out text and scribbles over recurrence relation',
        ambiguity_note: 'Severe ink scratch-out obscures the worst-case recurrence relation T(n) = T(n-1) + O(n). Zero error flag requires teacher to verify whether student correctly formulated recurrence or merely wrote the final complexity.',
      },
      {
        question_number: 'Q3',
        student_text: 'Dynamic programming needs Optimal Substructure (subproblems combine to form global solution) and Overlapping Subproblems (same subproblems are solved repeatedly). Memoization is top-down recursion with a cache dictionary, while tabulation is bottom-up building an array from base cases without stack recursion.',
      },
    ],
  },
];
