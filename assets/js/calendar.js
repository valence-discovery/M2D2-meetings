(function($) {

	"use strict";

	// Setup the calendar with the current date
$(document).ready(function(){
    var date = new Date();
    var today = date.getDate();
    // Set click handlers for DOM elements
    $(".right-button").click({date: date}, next_month);
    $(".left-button").click({date: date}, prev_month);
    $(".month").click({date: date}, month_click);
    // Set current month as active
    $(".months-row").children().eq(date.getMonth()).addClass("active-month");
    init_calendar(date);
    var events = check_events(today, date.getMonth()+1, date.getFullYear());
    show_events();
});

// Initialize the calendar by appending the HTML dates
function init_calendar(date) {
    $(".tbody").empty();
    $(".events-container").empty();
    var calendar_days = $(".tbody");
    var month = date.getMonth();
    var year = date.getFullYear();
    var day = date.getDate();
    var day_count = days_in_month(month, year);
    var row = $("<tr class='table-row'></tr>");
    var today = new Date();

    // Set date to 1 to find the first day of the month
    date.setDate(1);
    var first_day = date.getDay();
    // 35+firstDay is the number of date elements to be added to the dates table
    // 35 is from (7 days in a week) * (up to 5 rows of dates in a month)
    for(var i=0; i<35+first_day; i++) {
        // Since some of the elements will be blank, 
        // need to calculate actual date from index
        var day = i-first_day+1;
        // If it is a sunday, make a new row
        if(i%7===0) {
            calendar_days.append(row);
            row = $("<tr class='table-row'></tr>");
        }
        // if current index isn't a day in this month, make it blank
        if(i < first_day || day > day_count) {
            var curr_date = $("<td class='table-date nil'>"+"</td>");
            row.append(curr_date);
        }   
        else {
            var curr_date = $("<td class='table-date'>"+day+"</td>");
            var events = check_events(day, month+1, year);
            var isToday = today.getDate() == day && today.getMonth() == month && today.getFullYear() == year
            if(isToday && $(".active-date").length===0) {
                curr_date.addClass("active-date");
            } else if (new Date(year, month, day) < today) {
                curr_date.addClass("past-date");
            }
            
            // If this date has any events, style it with .event-date
            if(events.length!==0) {
                curr_date.addClass("event-date");
            }
            
            row.append(curr_date);
        }
    }
    
    show_events();
    
    // Append the last row and set the current year
    calendar_days.append(row);
    $(".year-month").text(months[month] + ", " + year);
}

// Get the number of days in a given month/year
function days_in_month(month, year) {
    var monthStart = new Date(year, month, 1);
    var monthEnd = new Date(year, month + 1, 1);
    return (monthEnd - monthStart) / (1000 * 60 * 60 * 24);    
}

// Event handler for when a date is clicked
function date_click(event) {
    $(".events-container").show(250);
    $("#dialog").hide(250);
    $(".active-date").removeClass("active-date");
    $(this).addClass("active-date");
};

// Event handler for when a month is clicked
function month_click(event) {
    $(".events-container").show(250);
    $("#dialog").hide(250);
    var date = event.data.date;
    $(".active-month").removeClass("active-month");
    $(this).addClass("active-month");
    var new_month = $(".month").index(this);
    date.setMonth(new_month);
    init_calendar(date);
}

// Event handler for when a month is clicked
function next_month(event) {
    $("#dialog").hide(250);
    var date = event.data.date;
    var new_month = date.getMonth() + 1;
    var year = date.getFullYear()
    
    if (new_month >= 12) {
        new_month = new_month - 12;
        year = year + 1
    }
    
    $(".year-month").text(months[new_month] + ", " + year);
    date.setMonth(new_month);
    date.setFullYear(year);
    
    $(".active-month").removeClass("active-month");
    $( ".month" ).each(function( index ) {
        if (index == new_month) {
            $(this).addClass("active-month");
        }
    });
    
    init_calendar(date);
}

// Event handler for when a month is clicked
function prev_month(event) {
    $("#dialog").hide(250);
    var date = event.data.date;
    var new_month = date.getMonth() - 1;
    var year = date.getFullYear()
    
    if (new_month < 0) {
        new_month = new_month + 12;
        year = year - 1;
    }
    
    $(".year-month").text(months[new_month] + ", " + year);
    date.setMonth(new_month);
    date.setFullYear(year);
    
    $(".active-month").removeClass("active-month");
    $( ".month" ).each(function( index ) {
        if (index == new_month) {
            $(this).addClass("active-month");
        }
    });
    
    init_calendar(date);
}


// Display all events of the selected date in card views
function show_events() {
    
    var past_events = []
    var upcoming_events = [];
    var today = new Date()
    
    for(var i=0; i<event_data["events"].length; i++) {
        var event = event_data["events"][i];
        var event_date = new Date(event["year"], event["month"] - 1, event["day"])
        if(event_date >= today) {
            upcoming_events.push(event);
        } else {
            past_events.push(event);
        }
    }
    
    // Clear the dates container
    $(".events-container").empty();
    $(".events-container").show(250);
    $(".events-container").append("<h6>Upcoming events</h6>");
    
    
    // If there are no events for this date, notify the user
    if(upcoming_events.length===0) {
        
    }

    else {
        // Go through and add each event as a card to the events container
        for(var i=0; i<upcoming_events.length; i++) {
            var date_str = upcoming_events[i]["day"] + " " + months[upcoming_events[i]["month"]-1] + ", " + upcoming_events[i]["year"];
            $(".events-container").append(create_card(upcoming_events[i]["title"], upcoming_events[i]["speaker"], date_str));
        }
        const next_event = upcoming_events[0];
        const next_date = next_event["month"] + "/" + next_event["day"] + "/" + next_event["year"];
        document.getElementById("cal_start").innerHTML = next_date + " 10:00 AM";
        document.getElementById("cal_end").innerHTML = next_date + " 11:00 AM";
        document.getElementById("title_and_speaker").innerHTML = (next_event["title"] + " - <b>" + next_event["speaker"] + " </b></br>" );
        document.getElementById("talk_abstract").innerHTML = next_event["abstract"];
        document.getElementById("speaker_bio").innerHTML = next_event["bio"];
    }

    }

function create_card(title, subtitle, date) {
    var html = "<div class='card my-3'>";
    html += "<div class='card-body'>";
    html += "<p class='card-title'><b>" + title + "</b></p>";
    html += "<p class='card-subtitle'>" + subtitle + "</p></div>";
    html += "<div class='card-footer'><span class='date'><i class='lni-calendar mr-2'></i>" + date + "</span></div>";
    html += "</div>";
    return html
}

// Checks if a specific date has any events
function check_events(day, month, year) {
    var events = [];
    for(var i=0; i<event_data["events"].length; i++) {
        var event = event_data["events"][i];
        if(event["day"]===day &&
            event["month"]===month &&
            event["year"]===year) {
                events.push(event);
            }
    }
    return events;
}

// Given data for events in JSON format
window.event_data = {
    "events": [
    {
        "title": "3D Infomax improves GNNs for Molecular Property Prediction",
        "speaker": "Hannes St&auml;rk",
        "year": 2022,
        "month": 1,
        "day": 12,
        "abstract": "Molecular property prediction is one of the fastest-growing applications of deep learning with critical real-world impacts. Including 3D molecular structure as input to learned models improves their performance for many molecular tasks. However, this information is infeasible to compute at the scale required by several real-world applications. We propose pre-training a model to reason about the geometry of molecules given only their 2D molecular graphs. Using methods from self-supervised learning, we maximize the mutual information between 3D summary vectors and the representations of a Graph Neural Network (GNN) such that they contain latent 3D information. During fine-tuning on molecules with unknown geometry, the GNN still generates implicit 3D information and can use it to improve downstream tasks. We show that 3D pre-training provides significant improvements for a wide range of properties, such as a 22% average MAE reduction on eight quantum mechanical properties. Moreover, the learned representations can be effectively transferred between datasets in different molecular spaces.",
        "bio": "Hannes is a research intern at MIT and received his master's from Technical University of Munich. He works on ML for graphs or other geometries and is interested in applications to small molecules and proteins.",
        "useful_links": [{"name":"3D Infomax", "link":"https://arxiv.org/pdf/2110.04126.pdf"}],
        "recording": "https://www.youtube-nocookie.com/embed/zXOZj2C5OD4",
        "slides": "https://drive.google.com/file/d/1iFLPdkZJzonbH3F1l5SA-yBmATi3V_mq/view?usp=sharing",
        "cancelled": false
    },
    {
        "title": "Challenges of Therapeutics Machine Learning in the Wild",
        "speaker": "Kexin Huang",
        "year": 2022,
        "month": 1,
        "day": 19,
        "abstract": "Machine learning for therapeutics offer incredible opportunities for expansion, innovation, and impact. Despite promises, many challenges exist. In this talk, the speaker will first highlight two high-impact but relatively understudied directions - ML-aided clinical trial design and low-data/cross-context biomedicine. Then, he will discuss challenges arising from therapeutics ML adoption in the wild, namely, generating actionable hypotheses and user interface with domain scientists. Lastly, challenges in infrastructure, such as data and benchmark, will be looked at.",
        "bio": "Kexin Huang is a CS PhD student at Stanford, advised by Prof. Jure Leskovec. His research interests lie in algorithmic challenges arising from real-world machine learning and biomedicine, with a focus on graph learning and therapeutics. He has conducted ML research in various companies and institutions such as Pfizer, IQVIA, Flatiron Health, Dana Farber Cancer Institute, and Rockefeller University.",
        "useful_links": [{"name":"HINT", "link":"https://www.sciencedirect.com/science/article/pii/S2666389922000186"},
            {"name":"DrugExplorer", "link":"https://osf.io/yhdpv/download"},
            {"name":"GMeta", "link":"https://proceedings.neurips.cc/paper/2020/file/412604be30f701b1b1e3124c252065e6-Paper.pdf"}],
        "recording": "https://www.youtube-nocookie.com/embed/WdDnRFl8oIw",
        "slides": "https://drive.google.com/file/d/1cdgWHkmLXPCz6XOLfRBbqG1uViUA6ZuU/view?usp=sharing",
        "cancelled": false
    },
    {
        "title": "Amortized Tree Generation for Bottom-up Synthesis Planning and Synthesizable Molecular Design",
        "speaker": "Wenhao Gao",
        "year": 2022,
        "month": 1,
        "day": 26,
        "abstract": "Molecular design and synthesis planning are two critical steps in the process of molecular discovery that we propose to formulate as a single shared task of conditional synthetic pathway generation. We report an amortized approach to generate synthetic pathways as a Markov decision process conditioned on a target molecular embedding. This approach allows us to conduct synthesis planning in a bottom-up manner and design synthesizable molecules by decoding from optimized conditional codes, demonstrating the potential to solve both problems of design and synthesis simultaneously. The approach leverages neural networks to probabilistically model the synthetic trees, one reaction step at a time, according to reactivity rules encoded in a discrete action space of reaction templates. We train these networks on hundreds of thousands of artificial pathways generated from a pool of purchasable compounds and a list of expert-curated templates. We validate our method with (a) the recovery of molecules using conditional generation, (b) the identification of synthesizable structural analogs, and (c) the optimization of molecular structures given oracle functions relevant to drug discovery.",
        "bio": "Wenhao Gao is a Ph.D. candidate in Chemical Engineering at MIT. Under advisory from Prof. Connor Coley, his research focuses on using artificial intelligence and robotic automation to accelerate chemical discovery processes. Before joining the Coley research group, he received his B.S. in Chemistry from Peking University and M.S. in Chemical and Biomolecular Engineering from Johns Hopkins University.",
        "useful_links": [{"name":"TreeGeneration", "link":"https://arxiv.org/pdf/2110.06389.pdf"}],
        "recording": "https://www.youtube-nocookie.com/embed/8waF9Uu4fdE",
        "slides": "https://drive.google.com/file/d/1gy0hA0pPufD90kia0JXeAwNB_jglLA2C/view?usp=sharing",
        "cancelled": false
    },
    {
        "title": "Model agnostic generation of counterfactual explanations for molecules",
        "speaker": "Geemi P. Wellawatte",
        "year": 2022,
        "month": 2,
        "day": 1,
        "abstract": "One of the challenges with deep learning is lack of model interpretability. This is a significant drawback in the chemistry domain as lack of knowledge why a certain prediction was made dissuades chemists to trust predictions from deep learning. In this work we propose a method that can provide local explanations for arbitrary models with the use of molecular counterfactuals. These are sparse explanations composed of molecular structures. A counterfactual is an example as close to the original, but with a different outcome. Although relatively new to AI, counterfactual explanations are a mature topic in philosophy and mathematics. We use counterfactuals to answer, \"what is the smallest change to the features that would alter the prediction\". Our Molecular Model Agnostic Counterfactual Explanations (MMACE), method is built on the STONED (Nigam et al., 2021) algorithm to traverse a local chemical space around a given base molecule to identify counterfactuals. Further, we introduce an open-source software named “exmol” that implements the MMACE algorithm for generating counterfactual explanations.",
        "bio": "Geemi Wellawatte is a fourth year PhD candidate at the University of Rochester, working under the guidance of Prof. Andrew White. Her latest work focuses on explainable Artificial intelligence (XAI) with counterfactuals. Additionally, she investigates applications of  ML in coarse-grained molecular dynamics (CG-MD). She holds a B.Sc. degree in Computational Chemistry from University of Colombo, Sri Lanka and a master's degree in Chemistry from the University of Rochester. She is a recipient of MolSSI Covid-19 seed fellowship, Sherman-Clarke Fellowship and Esther M. Conwell graduate fellowship from University of Rochester.",
        "useful_links": [{"name":"ExMol", "link":"https://chemrxiv.org/engage/api-gateway/chemrxiv/assets/orp/resource/item/6115baf04cb4797dc42df605/original/model-agnostic-generation-of-counterfactual-explanations-for-molecules.pdf"}],
        "recording": "https://www.youtube-nocookie.com/embed/ZWnsLHgzmSU",
        "slides": "",
        "cancelled": false
    },
    {
        "title": "Functionally Regionalized Knowledge Transfer for Low-resource Drug Discovery",
        "speaker": "Huaxiu Yao",
        "year": 2022,
        "month": 2,
        "day": 8,
        "abstract": "Meta-learning transfers knowledge across tasks and domains to learn new tasks efficiently, which has shown promise in drug discovery. However, the generalization ability of current meta-learning methods is limited by task heterogeneity and memorization. In this talk, I will first introduce two general principles to improve the generalization ability in meta-learning: organization and augmentation. Then, I will present several concrete few-shot drug discovery instantiations of using each principle. This includes algorithms to organize and adapt knowledge and a simple method for sufficiently overcoming task memorization. The remaining challenges and promising future research directions will also be discussed.",
        "bio": "Huaxiu Yao is a Postdoctoral Scholar of Computer Science at Stanford University, working with Prof. Chelsea Finn. His current research focuses on building machine learning models that are robust to distribution shifts. He is also passionate about applying these methods to solve real-world problems with limited data. He obtained his Ph.D. degree from Pennsylvania State University. His research results have been published in top venues such as ICML, ICLR, NeurIPS, KDD, AAAI. He previously served as tutorial speaker in KDD, IJCAI, AAAI, and MetaLearn workshop organizer in NeurIPS.",
        "useful_links": [{"name":"FRML", "link":"https://proceedings.neurips.cc/paper/2021/file/459a4ddcb586f24efd9395aa7662bc7c-Paper.pdf"}],
        "recording": "https://www.youtube-nocookie.com/embed/UsTvKhBnF-I",
        "slides": "",
        "cancelled": false
    },
    {
        "title": "Combining Latent Space and Structured Kernels for Bayesian Optimization over Combinatorial Spaces",
        "speaker": "Aryan Deshwal",
        "year": 2022,
        "month": 2,
        "day": 15,
        "abstract": "Scientists and engineers in diverse domains need to perform expensive experiments to optimize combinatorial spaces, where each candidate input is a discrete structure (e.g., sequence, tree, graph) or a hybrid structure (mixture of discrete and continuous design variables). For example, in drug and vaccine design, we need to search a large space of molecules guided by physical lab experiments. These experiments are often performed in a heuristic manner by humans and without any formal reasoning. Bayesian optimization (BO) is an efficient framework for optimizing expensive black-box functions. However, most of the BO literature is largely focused on optimizing continuous spaces. In this talk, I will discuss the main challenges in extending BO framework to combinatorial structures and some algorithms that I have developed in addressing them.",
        "bio": "Aryan Deshwal is a senior PhD student in the School of EECS at Washington State University (WSU). His general research interests are in AI and ML with a focus on probabilistic modeling and optimization to support decision-making under uncertainty in structured domains. The overarching goal of his research is to develop principled ML solutions to accelerate engineering design and scientific discovery towards high-impact sustainability applications. His research is published at top-tier venues including ICML, NeurIPS, AAAI, IJCAI, and JAIR. He won many awards including an Outstanding Dissertation Award (2020) from WSU for his MS Thesis, Outstanding Teaching Assistant Award from the College of Engineering, and Outstanding Reviewer Awards from ICML (2020, 2021) and ICLR (2021) conferences. He is the lead organizer of the \"Annual Workshop on AI to Accelerate Science and Engineering\" and the Tutorial on \"Recent Advances in Bayesian Optimization\" at AAAI conference (2022).",
        "useful_links": [{"name":"LADDER", "link":"https://arxiv.org/pdf/2111.01186.pdf"},
                         {"name":"MerCBO", "link": "https://www.aaai.org/AAAI21Papers/AAAI-5637.DeshwalA.pdf"}],
        "recording": "https://www.youtube-nocookie.com/embed/TKnUiGwTo3A",
        "slides": "https://drive.google.com/file/d/155_8M4_zMt005ydLQw7aMTbwR4lyj_k5/view?usp=sharing",
        "cancelled": false
    },
    {
        "title": "Scalable Geometric Deep Learning on Molecular Graphs",
        "speaker": "Nathan C. Frey",
        "year": 2022,
        "month": 2,
        "day": 22,
        "abstract": "Deep learning in molecular and materials sciences is limited by the lack of integration between applied science, artificial intelligence, and high-performance computing. Bottlenecks with respect to the amount of training data, the size and complexity of model architectures, and the scale of compute infrastructure are all key factors limiting the scaling of deep learning for molecules and materials. In cases where design goals require explorations of vast areas of chemical/material space, or target properties are prohibitively expensive to compute, efficient use of resources and careful choice of method enable new capabilities for design. We explore interactive supercomputing for applying high-throughput virtual screening and machine learning to challenges in materials and chemistry. The abundance of data from first-principles calculations introduces a need to identify and investigate scalable neural network architectures that operate on graphs, which are a natural representation for atomistic systems. We present LitMatter, a lightweight framework for scaling geometric deep learning methods. We discuss scaling atomistic deep learning using key resources including compute, model and dataset sizes, and energy. We train four graph neural network architectures on over 400 GPUs and investigate the scaling behavior of these methods. Depending on the model architecture, training time speedups up to 60x are seen. Empirical neural scaling relations quantify the model-dependent scaling and enable optimal compute resource allocation and the identification of scalable geometric deep learning model implementations. Training speed estimation and energy monitoring are used to accelerate hyperparameter optimization for neural interatomic potentials, and quantify the efficiency of physics-informed architectures. We discuss applications of scalable ML to property prediction tasks, deep generative modeling, and neural force fields for fully differentiable simulations.",
        "bio": "Nathan Frey is a postdoctoral associate at MIT working with the Lincoln Lab Supercomputing and AI groups, and Professors Connor Coley and Rafael Gómez-Bombarelli. He was a National Defense Science &amp; Engineering Graduate Fellow at the University of Pennsylvania, where he obtained a PhD in Materials Science. Dr. Frey was also an affiliate scientist with the Materials Project at Berkeley Lab, developing theoretical and computational methods to study quantum materials. He is a core contributor to DeepChem, an open-source library for deep learning in chemistry and life sciences. Dr. Frey’s research integrates physics-based simulation, high- performance computing, and machine learning to gain physical insight into atomistic systems for applications in energy, quantum information, and biotechnology. He has published more than 20 scientific papers in journals such as Science Advances, ACS Nano, JACS, and Chemistry of Materials.",
        "useful_links": [{"name": "LitMatter", "link": "https://arxiv.org/pdf/2112.03364.pdf"},
                         {"name": "Benchmarking", "link": "https://arxiv.org/pdf/2201.12423.pdf"}],
        "recording": "https://www.youtube-nocookie.com/embed/vh9yeKYwumA",
        "slides": "",
        "cancelled": false
    },
    {
        "title": "Accelerating Organic Synthesis with Chemical Language Models",
        "speaker": "Philippe Schwaller",
        "year": 2022,
        "month": 3,
        "day": 1,
        "abstract": "In organic chemistry, we are currently witnessing a rise in artificial intelligence (AI) approaches, which show great potential for improving molecular designs, facilitating synthesis and accelerating the discovery of novel molecules. Based on an analogy between written language and organic chemistry, we built linguistics-inspired transformer neural network models for chemical reaction prediction, synthesis planning, and the prediction of experimental actions. We extended the models to chemical reaction classification and fingerprints. By finding a mapping from discrete reactions to continuous vectors, we enabled efficient chemical reaction space exploration. Moreover, we specialized similar models for reaction yield predictions. Intrigued by the remarkable performance of chemical language models, we discovered that the models can capture how atoms rearrange during a reaction, without supervision or human labelling, leading to the development of the open-source atom-mapping tool <a href=\"http://rxnmapper.ai/\">RXNMapper</a>. During my talk, I will provide an overview of the different contributions that are at the base of this digital synthetic chemistry revolution.",
        "bio": "Philippe Schwaller received a bachelor’s and master’s degree in Materials Science and Engineering from EPFL.  While working for IBM Research, Philippe completed an MPhil degree in Physics at the University of Cambridge and a PhD in Chemistry and Molecular Sciences with the Reymond group at the University of Bern. In February 2022, Philippe joined EPFL as a tenure-track assistant professor in the Institute of Chemical Sciences and Engineering. He leads the Laboratory of Artificial Chemical Intelligence (<a href=\"https://twitter.com/SchwallerGroup\">LIAC</a>), which works on AI-accelerated discovery and synthesis of molecules. Philippe is also a core PI of the NCCR Catalysis, a Swiss centre for sustainable chemistry research, education, and innovation.",
        "useful_links": [{"name": "RXNMapper", "link": "https://github.com/rxn4chemistry/rxnmapper"},
                         {"name": "Unsupervised Grammar", "link": "https://www.science.org/doi/pdf/10.1126/sciadv.abe4166"}],
        "recording": "https://www.youtube-nocookie.com/embed/3WbrYKO38PA",
        "slides": "",
        "cancelled": false
    },
    {
        "title": "Unbiased de novo generation of organic molecular materials",
        "speaker": "Thomas Cauchy",
        "year": 2022,
        "month": 3,
        "day": 8,
        "abstract": "Beyond the active search for new drugs, de novo generation methods are also a great opportunity for the discovery of molecular materials. However, the chemical space of these materials differs from that of bioactive molecules. This conference will present the challenges inherent to this kind of problems. For most molecular materials, new targets must have specific electronic properties. This normally means a very costly evaluation by quantum mechanical calculations. Furthermore this evaluation requires a knowledge of the atomic positions in three dimensions. All these specific constraints have led us to propose our own generation method based on EvoMol, an efficient evolutionary algorithm. Free to travel the whole chemical space, the methods that limit the solutions to realistic molecules will be presented.",
        "bio": "Trained as a theoretical molecular chemist, Thomas completed his PhD concerning molecular magnetism under the supervision of Eliseo Ruiz at the University of Barcelona. He is now an assistant professor at the University of Angers. With his experimental colleagues, they work on the development of new organic molecular materials such as organic electronics. For several years, he has also been collaborating with Benoit Da Mota (University of Angers) on the application of combinatorial optimization and machine learning methods for molecular chemistry.",
        "useful_links": [{"name": "EvoMol", "link": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7494000/"}],
        "recording": "https://www.youtube-nocookie.com/embed/DLaJ529c1ag",
        "slides": "https://drive.google.com/file/d/1UH3ZTq1JcA2Szps20c6sdd8tzPRwYFVF/view?usp=sharing",
        "cancelled": false
    },
    {
        "title": "Structured Refinement Network for Antibody Design",
        "speaker": "Wengong Jin",
        "year": 2022,
        "month": 3,
        "day": 15,
        "abstract": "Antibodies are versatile proteins that bind to pathogens like viruses and stimulate the adaptive   immune system. The antibody binding affinity is determined by complementarity-determining regions   (CDRs) at the tips of these Y-shaped proteins, which closely interact with antigen residues   (epitopes). In this talk, I will present new generative models to automatically design the   CDRs of antibodies with desired binding affinity. Specifically, our model seeks to co-design the   sequence and 3D structure of CDRs as graphs. It unravels a sequence autoregressively while iteratively   refining its predicted global 3D structure. Our model is evaluated on binder design tasks and shows   superior performance compared to existing baselines.",
        "bio": "Wengong Jin is a postdoctoral fellow at Eric and Wendy Schmidt Center of Broad Institute.   He finished his Ph.D. in MIT CSAIL, advised by Regina Barzilay and Tommi Jaakkola.   His research seeks to develop novel machine learning algorithms for biology,   including drug discovery, immunology, genetic engineering, and synthetic biology. He is particularly   interested in deep generative models, graph neural networks, and geometric deep learning.",
        "useful_links": [{"name": "RefineGNN", "link": "https://arxiv.org/pdf/2110.04624.pdf"}],
        "recording": "https://www.youtube-nocookie.com/embed/uDTccbg_Ai4",
        "slides": "https://drive.google.com/file/d/18IBPzowIUMbT4dX6N1WSRPqWRx6oTdOx/view?usp=sharing",
        "cancelled": false
    },
    {
        "title": "Quantum Machine-Learning for Drug-like Molecules",
        "speaker": "Clemens Isert",
        "year": 2022,
        "month": 3,
        "day": 22,
        "abstract": "Machine learning methodologies have become increasingly established in many chemistry-related   disciplines. Recent advances in quantum machine learning (QML) have enabled the prediction   of QM-properties at a fraction of the cost of first-principle methods such as density   functional theory (DFT). However, previous work has generally been focused on molecular   systems of limited size and atom type diversity, hindering its application to adjacent fields   such as drug discovery. The limited availability of open-source, high-performance models has   further rendered the adoption of this progress to new fields challenging. We introduce two   contributions towards overcoming these issues: The QMugs data collection (Quantum Mechanical   properties of drUG-like moleculeS) provides a wide array of QM-properties for large and biologically   relevant molecules, increasing the chemical space accessible to machine intelligence methods.   The open-source DelFTa package, built on the QMugs dataset, provides a user-friendly interface   to obtain accurate DFT-approximations at low computational cost using 3D-message passing   neural networks. The model's predictive performance is increased when, instead of directly   predicting the quantity of interest, a correction to a semi-empirical baseline is predicted instead.",
        "bio": "Clemens is a third-year PhD student in the group of Prof. Gisbert Schneider at   ETH Zurich and currently doing an internship in the Computer-Assisted Drug   Design group at Novartis. After his undergraduate studies in Chemical Engineering,   he first got into cheminformatics and machine learning during his master thesis at   MIT working with Connor Coley and Klavs F. Jensen. Clemens’ research interests   lie in exploring how quantum mechanical calculations can be used in the drug discovery process.",
        "useful_links": [{"name": "QMugs", "link": "https://arxiv.org/abs/2107.00367"},
                         {"name": "DelFTa", "link": "https://chemrxiv.org/engage/chemrxiv/article-details/61c02f7e7f367e306759a0fd"}],
        "recording": "https://www.youtube-nocookie.com/embed/4eyh3GhhvHg",
        "slides": "https://drive.google.com/file/d/19qh1puEktphwDHI1GAdeWn34pB7NRWyt/view?usp=sharing",
        "cancelled": false
    },
    {
        "title": "Euclidean Deep Learning Models for 3D Structures and Interactions of Molecules",
        "speaker": "Octavian-Eugen Ganea",
        "year": 2022,
        "month": 3,
        "day": 29,
        "abstract": "Understanding the 3D structures and interactions of proteins and drug-like molecules is a key part of therapeutics discovery. A core problem is molecular docking, i.e., determining how two molecules attach and create a molecular complex. Having access to very fast accurate computational docking tools would enable applications such as virtual screening of cancer protein inhibitors, de novo drug design, or rapid in silico drug side-effect prediction. However, existing computer models are insufficient, being very time-consuming and having difficulties exploring the vast space of molecular complex candidates. In this talk, I will show that geometry and deep learning (DL) can significantly reduce this enormous search space inherent in docking and molecular conformation prediction. I will present EquiDock and EquiBind, our recent DL architectures for direct shot prediction of the molecular complex, and GeoMol, a model for 3D molecular flexibility. I will argue that the governing laws of geometry, physics, or chemistry that naturally constrain these 3D structures should be incorporated in DL solutions in a mathematically meaningful way. This will be exemplified by leveraging key modeling concepts such as SE(3)-equivariant graph matching networks, optimal transport for binding pocket prediction, and torsion angle neural networks. Our approaches reduce the inference runtimes of open-source and commercial software by factors of tens or hundreds, while being competitive or better in terms of quality.",
        "bio": "Octavian Ganea is a postdoctoral researcher at CSAIL-MIT working with Tommi Jaakkola and Regina Barzilay on deep learning solutions for drug discovery and structural biology using geometric and physical inductive biases. He is part of and contributes to the Machine Learning for Pharmaceutical Discovery and Synthesis consortium, the Abdul Latif Jameel Clinic for Machine Learning in Health, the DARPA Accelerated Molecular Discovery program, and the ELLIS society. Octavian received his PhD from ETH Zurich under the supervision of Thomas Hofmann working on non-Euclidean representation learning for graphs, hierarchical data, and natural language processing. His published research includes a spotlight at ICLR 2022, spotlights at NeurIPS 2021 and 2018, and oral talks at ICML 2018 and 2019.",
        "useful_links": [{"name": "EquiDock", "link": "https://arxiv.org/abs/2111.07786"},
                        {"name": "EquiBind", "link": "https://arxiv.org/abs/2202.05146"},
                        {"name": "GeoMol", "link": "https://proceedings.neurips.cc/paper/2021/file/725215ed82ab6306919b485b81ff9615-Paper.pdf"}],
        "recording": "https://www.youtube-nocookie.com/embed/706KjyR-wyQ",
        "slides": "",
        "cancelled": false
    },
    {
        "title": "Sequential model optimization for combo-drug repurposing",
        "speaker": "Paul Bertin",
        "year": 2022,
        "month": 4,
        "day": 5,
        "abstract": "Combining drugs opens new possibilities for tailoring therapies to a given disease and   targeting several biological pathways at the same time. However the number of possible   drug combinations is huge, and only a tiny portion of this space can be explored in a   reasonable amount of time. One could either narrowly focus on experimenting with a very   restricted number of well-chosen drugs, based on pre-existing biological knowledge, or   broaden the scope by exploring uncharted territories with the risk of very low time and   cost efficiency. In order to balance between these two approaches, we propose to drive   the exploration of the drug combination space with a sequential model optimization algorithm.   We iteratively perform model-guided wet lab experiments and adapt to newly acquired data.   After only three rounds of in vitro experimentation, we found that the set of combinations   queried by our model was enriched for highly synergistic combinations. Remarkably, we   rediscovered a synergistic drug combination that was later confirmed to be under study   within clinical trials.",
        "bio": "Paul Bertin  is a third year PhD student at Mila, advised by Yoshua Bengio. He received his   Masters degree in Applied Mathematics from the ENS Paris-Saclay under the supervision of   Stanley Durrleman and Nicolas Renier, working on 3D embedded graphs to better understand the   organization of brain vessel networks. His current research seeks to develop   machine learning methods for predicting the response of cells to perturbations: chemicals or biologics. He is especially   interested in taking inspiration from the causal inference literature, as well as Cell biology.",
        "useful_links": [{"name": "RECOVER", "link": "https://arxiv.org/abs/2202.04202"},
                         {"name": "Github", "link": "https://github.com/RECOVERcoalition/Recover"}],
        "recording": "https://www.youtube-nocookie.com/embed/zWldQSYG1gQ",
        "slides": "https://drive.google.com/file/d/1pOB0ATMXgetRhQ1i3oIDz9qhfkhKJs13/view?usp=sharing",
        "cancelled": false
    },
    {
        "title": "Epistemic Uncertainty Estimation for Efficient Search of Drug Candidates",
        "speaker": "Moksh Jain",
        "year": 2022,
        "month": 4,
        "day": 12,
        "abstract": "In computational drug discovery we often rely on surrogate models for molecular design and   optimization. The estimates of the epistemic uncertainty of those surrogate models can be   useful signals to enable efficient exploration in the molecular space. Traditional methods   such as Bayesian optimization use Bayesian models like Gaussian Processes (GPs) as surrogates.   Gaussian processes provide well calibrated uncertainty estimates, but do not scale trivially   to large datasets and require hand-crafted kernels to work with structured data like strings   (SMILES, peptides) and graphs. Despite their impressive performance across various domains,   efficient and accurate epistemic uncertainty estimation for neural networks remains an open   problem. Existing approaches rely on approximations based on Bayesian interpretations of   neural networks to obtain uncertainty estimates. These estimates, however tend to be poorly   calibrated and do not account for the effect of model misspecification. This is critical in   interactive settings where the model predictions are used to acquire data. In this talk,   I will present DEUP, a novel method for uncertainty estimation designed for interactive settings,   which uses an additional network to predict the epistemic uncertainty. I will also discuss a   real-world application leveraging epistemic uncertainty estimates for designing anti-microbial peptides.",
        "bio": "Moksh is a graduate student at Mila and the University of Montreal, where he is supervised   by Prof. Yoshua Bengio. His is interested in developing deep learning methods for sequential   decision making, and their applications for scientific discovery. Before joining Mila, he   spent a year working on resource efficient machine learning methods at Microsoft, after   graduating with a bachelor\'s degree from NITK Surathkal.",
        "useful_links": [{"name": "DEUP", "link": "https://arxiv.org/pdf/2102.08501.pdf"},
                         {"name": "AMP Design", "link": "https://arxiv.org/pdf/2203.04115.pdf"}],
        "recording": "https://www.youtube-nocookie.com/embed/TIZ2FyLi_3o",
        "slides": "https://drive.google.com/file/d/1bdU0mVzcr646YNdY0klx6kiwHeJ6woun/view?usp=sharing",
        "cancelled": false
    },
    {
        "title": "Can graph neural networks understand chemistry?",
        "speaker": "Dominique Beaini",
        "year": 2022,
        "month": 4,
        "day": 22,
        "abstract": "In this talk, I will explain how to empower graph neural networks (GNNs) for molecular property   prediction with more expressive models and large datasets. Graph neural networks (GNNs) have   emerged as one of the most important innovations for machine learning in drug discovery.   Their ability to work on unstructured data enables us to use deep learning on molecular graphs,   with the promise of predicting molecular properties with the same speed and accuracy that   convolutional networks process images. However, GNNs face unprecedented challenges that I   address in the talk, including the difficulty of detecting sub-structures, modeling non-covalent   interactions, and the lack of large datasets.",
        "bio": "Dominique is a lead researcher at Valence Discovery, an adjunct professor at the University   of Montreal, and an associate industry member at Mila. He has led various projects meant to   improve the expressiveness of graph neural networks and is leading the development of   large-scale models for chemistry at Valence Discovery.",
        "useful_links": [],
        "recording": "",
        "slides": "",
        "cancelled": false
    },
    {
        "title": "No meeting",
        "speaker": "No meeting",
        "year": 2022,
        "month": 4,
        "day": 26,
        "abstract": "",
        "bio": "",
        "useful_links": [],
        "recording": "",
        "slides": "",
        "cancelled": true
    },
    {
        "title": "Exposing the limitations of molecular machine learning with activity cliffs",
        "speaker": "Derek van Tilborg",
        "year": 2022,
        "month": 5,
        "day": 3,
        "abstract": "",
        "bio": "",
        "useful_links": [],
        "recording": "",
        "slides": "",
        "cancelled": false
    },
    {
        "title": "Learning 3D Representations Of Molecular Chirality With Invariance To Bond Rotations",
        "speaker": "Keir Adams",
        "year": 2022,
        "month": 5,
        "day": 10,
        "abstract": "",
        "bio": "",
        "useful_links": [],
        "recording": "",
        "slides": "",
        "cancelled": false
    },
    {
        "title": "Prediction of stable ternary complexes",
        "speaker": "Noah Weber",
        "year": 2022,
        "month": 5,
        "day": 17,
        "abstract": "",
        "bio": "",
        "useful_links": [],
        "recording": "",
        "slides": "",
        "cancelled": false
    }
    ]
};

const months = [ 
    "January", 
    "February", 
    "March", 
    "April", 
    "May", 
    "June", 
    "July", 
    "August", 
    "September", 
    "October", 
    "November", 
    "December" 
];

window.past_events = []
var today = new Date()

for(var i=0; i<event_data["events"].length; i++) {
    var event = event_data["events"][i];
    var event_date = new Date(event["year"], event["month"] - 1, event["day"])
    if(event_date < today) {
        event["date"] = "Tue " + months[event["month"]-1] + " " + event["day"] + ", " + event["year"];
        past_events.push(event);
    }
}

})(jQuery);
